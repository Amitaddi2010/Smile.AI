"""
SMILE-AI Conversational AI Routes
Interactive mode: conversational check-in with silent data extraction.
"""
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from ..database import get_db
from ..models.user import User, JournalEntry, Assessment
from ..services.auth_service import get_current_user
from ..services.ai_service import ai_service
from ..services.fusion_service import fusion_service
import logging

log = logging.getLogger("smile.conversation")

router = APIRouter(prefix="/conversation", tags=["Conversational AI"])


class MessageInput(BaseModel):
    message: str
    conversation_history: List[dict] = []


class ExtractSessionInput(BaseModel):
    conversation_history: List[dict]


SMILE_SYSTEM_PROMPT = """You are SMILE-AI, a warm, emotionally intelligent mental health companion built into the SMILE platform. You are NOT a chatbot. You are NOT a form. You are a supportive presence that users can talk to freely.

CONVERSATION RULES:
1. Ask only ONE question at a time. Never list multiple questions.
2. Match the user's energy — calm if sad, light if cheerful, grounded if anxious.
3. Use simple, everyday language. No clinical terms ever shown to the user.
4. If the user says "I don't know" or goes quiet — gently redirect, never push.
5. Support short replies, long rants, emojis — all are valid.
6. Keep responses concise (2-4 sentences max). Be conversational, not essay-like.
7. Naturally weave in questions about sleep, stress, energy, social life, diet, exercise — but NEVER in a clinical way.
8. If the user seems positive, celebrate with them. If negative, validate first.
9. NEVER reveal that you are extracting data or running assessments silently.

SAFETY PROTOCOL (HIGHEST PRIORITY):
- If ANY message suggests suicidal ideation, self-harm, or crisis:
  1. Respond with empathy FIRST — never with resources as the opening line.
  2. After acknowledgment, gently offer support resources.
  3. Never leave the user mid-conversation.

Keep your tone warm, authentic, and human-like. You are a caring friend — not a doctor, not a therapist, not a form."""


EXTRACTION_SYSTEM_PROMPT = """You are a clinical data extraction engine. Given a conversation between a student and SMILE-AI, extract structured mental health data. Return ONLY valid JSON. No markdown, no explanation.

Extract this exact JSON structure:
{
  "mood_score": <1-10 integer, 1=terrible 10=excellent>,
  "mood_label": "<one word: joyful/calm/neutral/anxious/stressed/sad/angry>",
  "energy_level": "<low/moderate/high>",
  "sleep_hours": <float 0-12, null if not mentioned>,
  "sleep_quality": "<good/fair/poor/null>",
  "social_connection": "<isolated/connected/mixed/unknown>",
  "key_stressors": ["<list of specific stressors mentioned>"],
  "positive_moments": ["<list of positive things mentioned>"],
  "journal_entry": "<A 3-5 sentence first-person journal paragraph written in the user's own voice and tone, summarizing their day and feelings>",
  "phq9_estimated": <0-27 integer based on depression indicators>,
  "gad7_estimated": <0-21 integer based on anxiety indicators>,
  "stress_level": "<Low/Moderate/High>",
  "flags": ["<relevant flags: sleep_issues, social_isolation, low_energy, academic_stress, etc>"],
  "safety_alert": <true/false>,
  "data_confidence": "<low/medium/high based on how much info was shared>"
}

Rules:
- Infer PHQ-9 from: mood, hopelessness, fatigue, loss of interest, sleep, appetite, concentration, self-worth
- Infer GAD-7 from: worry, nervousness, restlessness, irritability, feeling overwhelmed, fear
- If info is missing, make reasonable conservative estimates
- journal_entry should read like the user wrote it themselves
- ONLY output the JSON object, nothing else"""


@router.post("/chat")
async def conversation_chat(
    input_data: MessageInput,
    user: User = Depends(get_current_user)
):
    """Send a message in the conversational check-in."""
    # Build messages for the LLM
    system = SMILE_SYSTEM_PROMPT + f"\n\nThe user's name is {user.name}."
    
    if not input_data.conversation_history:
        system += "\nThis is the START of the conversation. Greet them warmly by name and ask how they are feeling today."
    
    messages_for_llm = [{"role": "system", "content": system}]
    
    for msg in input_data.conversation_history:
        messages_for_llm.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", "")
        })
    
    messages_for_llm.append({"role": "user", "content": input_data.message})
    
    try:
        completion = ai_service.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages_for_llm,
            temperature=0.8,
            max_completion_tokens=300,
            top_p=0.95,
            stream=False
        )
        response = completion.choices[0].message.content
    except Exception as e:
        log.error(f"Conversation chat error: {e}")
        response = "I'm here with you. Could you tell me a bit more about how you're feeling?"
    
    return {"response": response}


@router.post("/extract")
async def extract_session_data(
    input_data: ExtractSessionInput,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Extract structured data from conversation and auto-save to Journal + Assessment."""
    if len(input_data.conversation_history) < 2:
        raise HTTPException(status_code=400, detail="Conversation too short for extraction")
    
    # Build conversation transcript
    transcript = "\n".join([
        f"{'User' if m.get('role') == 'user' else 'SMILE'}: {m.get('content', '')}"
        for m in input_data.conversation_history
    ])
    
    # Extract structured data via LLM
    try:
        completion = ai_service.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                {"role": "user", "content": f"Extract data from this conversation:\n\n{transcript}"}
            ],
            temperature=0.2,
            max_completion_tokens=600,
            response_format={"type": "json_object"},
            stream=False
        )
        raw = completion.choices[0].message.content
        extracted = json.loads(raw)
    except Exception as e:
        log.error(f"Extraction error: {e}")
        extracted = {
            "mood_score": 5, "mood_label": "neutral", "energy_level": "moderate",
            "sleep_hours": None, "journal_entry": "Session could not be fully processed.",
            "phq9_estimated": 5, "gad7_estimated": 5, "stress_level": "Moderate",
            "flags": [], "safety_alert": False, "data_confidence": "low"
        }
    
    # Auto-save Journal Entry — run through ALL 3 trained ML models via Fusion Engine
    journal_text = extracted.get("journal_entry", "Interactive session completed.")
    
    # Build assessment context from LLM-extracted data so Fusion uses ALL models
    sleep_hours = extracted.get("sleep_hours") or 7.0
    stress_map = {"Low": 3, "Moderate": 5, "High": 8}
    stress_val = stress_map.get(extracted.get("stress_level", "Moderate"), 5)
    
    assessment_context = {
        "screen_time": 5.0,
        "sleep_duration": float(sleep_hours),
        "social_media_hours": 3.0,
        "stress_level": stress_val,
        "academic_pressure": stress_val,
        "family_history": False
    }
    
    try:
        # This calls ALL 3 trained models: Text (XGB), Lifestyle (XGB), Behavioral (XGB)
        # Plus LLM reasoning was used above to extract the structured data
        fusion_result = fusion_service.analyze_journal(journal_text, assessment_context)
    except Exception as fe:
        log.error(f"Fusion Engine error: {fe}")
        fusion_result = {"smile_risk_index": 0, "risk_level": "low", "is_crisis": False}
    
    journal_entry = JournalEntry(
        user_id=user.id,
        title=f"SMILE Session — {datetime.now().strftime('%b %d')}",
        self_reported_mood=extracted.get("mood_label", "neutral"),
        text_content=journal_text,
        smile_risk_index=fusion_result.get("smile_risk_index"),
        risk_level=fusion_result.get("risk_level"),
        is_crisis=fusion_result.get("is_crisis", False),
        fusion_details=json.dumps(fusion_result),
    )
    db.add(journal_entry)
    
    # Auto-save Assessment
    assessment = Assessment(
        user_id=user.id,
        age=20,
        gender="Unknown",
        department="Unknown",
        cgpa=3.0,
        sleep_duration=float(sleep_hours),
        study_hours=5.0,
        social_media_hours=3.0,
        physical_activity=60,
        stress_level=stress_val,
        risk_score=fusion_result.get("smile_risk_index", 0),
        risk_level=fusion_result.get("risk_level", "low"),
        depression_probability=round(extracted.get("phq9_estimated", 5) / 27.0, 4),
        top_factors=json.dumps(extracted.get("flags", [])),
    )
    db.add(assessment)
    
    db.commit()
    db.refresh(journal_entry)
    
    # Return comprehensive result including which models contributed
    return {
        "status": "success",
        "extracted": extracted,
        "journal_id": journal_entry.id,
        "smile_risk_index": fusion_result.get("smile_risk_index"),
        "risk_level": fusion_result.get("risk_level"),
        "models_used": {
            "reasoning": "Groq LLaMA-3.3-70B (LLM for conversation + data extraction)",
            "trained_models": fusion_result.get("models_active", []),
            "component_scores": fusion_result.get("component_scores", {}),
        },
    }

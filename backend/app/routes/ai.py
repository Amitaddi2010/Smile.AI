"""
SMILE-AI AI Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User, Assessment
from ..schemas.schemas import AssessmentResponse
from ..services.auth_service import get_current_user
from ..services.ai_service import ai_service
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/ai", tags=["AI Insights"])


class QuestionInput(BaseModel):
    question: str


@router.post("/chat")
async def chat_with_smile(
    input_data: QuestionInput,
    user: User = Depends(get_current_user)
):
    """Chat with SMILE-AI supported by LLaMA 3.1."""
    prompt = input_data.question
    system_prompt = (
        f"You are SMILE-AI, a student mental health support assistant. "
        f"Talking to: {user.name}. "
        f"Style: Clinical but empathetic, professional yet accessible. "
        f"Context: Helping students manage stress, sleep, and academic pressure. "
        f"Disclaimer: Always mention you are an AI, not a doctor. If you detect crisis, recommend university Counseling services."
    )
    response = ai_service.get_completion(prompt, system_prompt)
    return {"response": response}


@router.get("/insights")
async def get_ai_wellbeing_insights(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate deep AI insights based on clinical history."""
    # Get latest assessments
    assessments = (
        db.query(Assessment)
        .filter(Assessment.user_id == user.id)
        .order_by(Assessment.created_at.desc())
        .limit(3)
        .all()
    )

    if not assessments:
        return {"insights": "No assessment data found. Please complete an audit to get AI-powered insights."}

    # Summarize history for AI
    summary = f"Student Profile: {user.name}\n"
    for a in assessments:
        summary += (
            f"- Date: {a.created_at.strftime('%Y-%m-%d')}\n"
            f"  Risk Score: {a.risk_score}, Level: {a.risk_level}\n"
            f"  Stress: {a.stress_level}/10, Sleep: {a.sleep_duration}h, Study: {a.study_hours}h\n"
            f"  CGPA: {a.cgpa}\n"
            f"  Gaming: {a.gaming_hours}h, Social: {a.social_media_hours}h\n"
            f"  Social Addiction: {a.social_media_addiction}/10, Gaming Addiction: {a.gaming_behavior_score}/10\n"
            f"  Academic Pressure: {a.academic_pressure}/10, Exam Anxiety: {a.exam_anxiety}/10\n"
        )

    insights = ai_service.analyze_wellbeing(summary)
    return {"insights": insights}

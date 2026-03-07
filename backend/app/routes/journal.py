"""
SMILE-AI Journal Routes (Text & Fusion Prediction)
"""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User, Assessment, JournalEntry
from ..schemas.schemas import JournalEntryInput, JournalEntryResponse
from ..services.auth_service import get_current_user
from ..services.fusion_service import fusion_service

router = APIRouter(prefix="/journal", tags=["Journal"])

@router.post("", response_model=JournalEntryResponse)
async def analyze_journal_entry(
    input_data: JournalEntryInput,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Analyze journal text using the Fusion Engine.
    Incorporates the user's most recent structured Assessment if available.
    """
    # 1. Fetch user's latest structured assessment for context
    latest_assessment = (
        db.query(Assessment)
        .filter(Assessment.user_id == user.id)
        .order_by(Assessment.created_at.desc())
        .first()
    )
    
    # Convert to dict if exists
    assessment_context = None
    if latest_assessment:
        assessment_context = {
            "screen_time": latest_assessment.screen_time,
            "sleep_duration": latest_assessment.sleep_duration,
            "social_media_hours": latest_assessment.social_media_hours,
            "stress_level": latest_assessment.stress_level,
            "academic_pressure": latest_assessment.academic_pressure,
            "family_history": latest_assessment.family_history
        }

    # 2. Run Fusion Service
    try:
        fusion_result = fusion_service.analyze_journal(input_data.text_content, assessment_context)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fusion Engine Error: {str(e)}")

    if "error" in fusion_result:
        raise HTTPException(status_code=500, detail=fusion_result["error"])

    # 3. Save to DB
    journal_entry = JournalEntry(
        user_id=user.id,
        text_content=input_data.text_content,
        smile_risk_index=fusion_result.get("smile_risk_index"),
        risk_level=fusion_result.get("risk_level"),
        is_crisis=fusion_result.get("is_crisis", False),
        fusion_details=json.dumps(fusion_result)
    )
    db.add(journal_entry)
    db.commit()
    db.refresh(journal_entry)

    return JournalEntryResponse.model_validate(journal_entry)

@router.get("/history", response_model=list[JournalEntryResponse])
async def get_journal_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get user's journal entry history."""
    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user.id)
        .order_by(JournalEntry.created_at.desc())
        .limit(50)
        .all()
    )
    return [JournalEntryResponse.model_validate(e) for e in entries]

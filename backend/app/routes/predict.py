"""
SMILE-AI Prediction Routes
"""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User, Assessment
from ..schemas.schemas import AssessmentInput, PredictionResult, AssessmentResponse
from ..services.auth_service import get_current_user
from ..services.prediction_service import prediction_service
from ..utils.wellness import award_xp

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post("", response_model=PredictionResult)
async def predict_risk(
    input_data: AssessmentInput,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Run mental health risk prediction on student input data."""
    # Prepare input dict
    features = input_data.model_dump()
    
    # Get prediction
    result = prediction_service.predict(features)
    
    # Save assessment to DB
    assessment = Assessment(
        user_id=user.id,
        age=input_data.age,
        gender=input_data.gender,
        department=input_data.department,
        cgpa=input_data.cgpa,
        sleep_duration=input_data.sleep_duration,
        study_hours=input_data.study_hours,
        social_media_hours=input_data.social_media_hours,
        physical_activity=input_data.physical_activity,
        stress_level=input_data.stress_level,
        screen_time=input_data.screen_time,
        gaming_hours=input_data.gaming_hours,
        financial_stress=input_data.financial_stress,
        family_history=input_data.family_history,
        academic_pressure=input_data.academic_pressure,
        gaming_behavior_score=input_data.gaming_behavior_score,
        social_media_addiction=input_data.social_media_addiction,
        academic_workload=input_data.academic_workload,
        peer_pressure=input_data.peer_pressure,
        exam_anxiety=input_data.exam_anxiety,
        risk_score=result['risk_score'],
        risk_level=result['risk_level'],
        depression_probability=result['depression_probability'],
        top_factors=json.dumps(result['top_factors']),
    )
    db.add(assessment)
    
    # Award Wellness XP for taking an assessment
    award_xp(user, 15) # Assessments are high-value actions
    
    db.commit()
    db.refresh(assessment)
    
    result['assessment_id'] = assessment.id
    return PredictionResult(**result)


@router.get("/history", response_model=list[AssessmentResponse])
async def get_assessment_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get user's assessment history."""
    assessments = (
        db.query(Assessment)
        .filter(Assessment.user_id == user.id)
        .order_by(Assessment.created_at.desc())
        .limit(50)
        .all()
    )
    return [AssessmentResponse.model_validate(a) for a in assessments]


@router.get("/model-info")
async def get_model_info():
    """Get ML model metadata and performance metrics."""
    return prediction_service.get_model_info()

"""
SMILE-AI Counselor Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ..database import get_db
from ..models.user import User, CounselorRating, CounselorHelp, UserRole
from ..schemas.schemas import (
    CounselorRatingInput, CounselorRatingResponse, 
    CounselorHelpInput, CounselorHelpResponse,
    CounselorPublicInfo, UserResponse
)
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/counselors", tags=["Counselors"])

@router.get("", response_model=List[CounselorPublicInfo])
async def list_counselors(db: Session = Depends(get_db)):
    """List all available counselors with their rating metadata."""
    counselors = db.query(User).filter(User.role == UserRole.COUNSELOR).all()
    
    results = []
    for c in counselors:
        # Calculate avg rating
        avg_data = db.query(
            func.avg(CounselorRating.rating).label("avg"),
            func.count(CounselorRating.id).label("count")
        ).filter(CounselorRating.counselor_id == c.id).first()
        
        results.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "role": c.role,
            "avg_rating": float(avg_data.avg or 0.0),
            "rating_count": int(avg_data.count or 0),
            "is_available": c.is_active
        })
    
    # Sort by rating (desc)
    results.sort(key=lambda x: x["avg_rating"], reverse=True)
    return results

@router.post("/rate", response_model=CounselorRatingResponse)
async def rate_counselor(
    input_data: CounselorRatingInput,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Allow a student to rate their counselor."""
    if user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can rate counselors")
    
    # Verify counselor exists
    counselor = db.query(User).filter(User.id == input_data.counselor_id, User.role == UserRole.COUNSELOR).first()
    if not counselor:
        raise HTTPException(status_code=404, detail="Counselor not found")

    # Check if already rated (update) or new
    existing = db.query(CounselorRating).filter(
        CounselorRating.student_id == user.id,
        CounselorRating.counselor_id == input_data.counselor_id
    ).first()
    
    if existing:
        existing.rating = input_data.rating
        existing.feedback = input_data.feedback
        rating_obj = existing
    else:
        rating_obj = CounselorRating(
            student_id=user.id,
            counselor_id=input_data.counselor_id,
            rating=input_data.rating,
            feedback=input_data.feedback
        )
        db.add(rating_obj)
    
    db.commit()
    db.refresh(rating_obj)
    return rating_obj

@router.post("/help", response_model=CounselorHelpResponse)
async def log_help_activity(
    input_data: CounselorHelpInput,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Allow a counselor to log a help activity for a student."""
    if user.role not in [UserRole.COUNSELOR, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only counselors or admins can log help activities")
    
    # Verify student exists
    student = db.query(User).filter(User.id == input_data.student_id, User.role == UserRole.STUDENT).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    new_log = CounselorHelp(
        counselor_id=user.id,
        student_id=input_data.student_id,
        activity_type=input_data.activity_type,
        notes=input_data.notes
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@router.get("/my-counselor", response_model=CounselorPublicInfo)
async def get_my_assigned_counselor(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Students can see their assigned counselor's profile."""
    if not user.counselor_id:
        raise HTTPException(status_code=404, detail="No counselor assigned")
    
    c = db.query(User).filter(User.id == user.counselor_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Assigned counselor not found")
        
    avg_data = db.query(
        func.avg(CounselorRating.rating).label("avg"),
        func.count(CounselorRating.id).label("count")
    ).filter(CounselorRating.counselor_id == c.id).first()
    
    return {
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "role": c.role,
        "avg_rating": float(avg_data.avg or 0.0),
        "rating_count": int(avg_data.count or 0),
        "is_available": c.is_active
    }

@router.post("/{counselor_id}/book")
async def book_counselor(
    counselor_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Students can book/assign a counselor to themselves."""
    if user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can book counselors")
    
    c = db.query(User).filter(User.id == counselor_id, User.role == UserRole.COUNSELOR).first()
    if not c:
        raise HTTPException(status_code=404, detail="Counselor not found")
    
    user.counselor_id = counselor_id
    db.commit()
    return {"message": f"Successfully booked {c.name}", "counselor_id": counselor_id}

"""
SMILE-AI Dashboard Routes
"""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models.user import User, Assessment, JournalEntry, CounselorHelp, CounselorRating
from ..schemas.schemas import (
    StudentSummary, DashboardStats, AssessmentResponse, 
    JournalEntryResponse, UserRoleUpdate, UserCounselorUpdate,
    CounselorHelpResponse, CounselorRatingResponse
)
from ..services.auth_service import get_current_user, require_role

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("counselor", "admin"))
):
    """Get dashboard statistics (counselor/admin)."""
    total_users = db.query(User).filter(User.role == "student").count()
    total_assessments = db.query(Assessment).count()
    
    # Risk distribution
    risk_counts = (
        db.query(Assessment.risk_level, func.count(Assessment.id))
        .group_by(Assessment.risk_level)
        .all()
    )
    risk_distribution = {level: count for level, count in risk_counts if level}
    
    # Average risk score
    avg_score = db.query(func.avg(Assessment.risk_score)).scalar() or 0
    
    # Recent assessments
    recent = (
        db.query(Assessment)
        .order_by(Assessment.created_at.desc())
        .limit(10)
        .all()
    )
    
    return {
        "total_users": total_users,
        "total_assessments": total_assessments,
        "risk_distribution": risk_distribution,
        "avg_risk_score": round(float(avg_score), 1),
        "recent_assessments": [AssessmentResponse.model_validate(a) for a in recent]
    }


@router.get("/students")
async def get_students_list(
    risk_filter: str = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("counselor", "admin"))
):
    """Get list of students with their risk levels (counselor/admin)."""
    query = db.query(User).filter(User.role == "student")
    
    # If requester is a counselor, only show explicitly assigned students
    if user.role == "counselor":
        query = query.filter(User.counselor_id == user.id)
        
    students = query.all()
    
    result = []
    for student in students:
        latest = (
            db.query(Assessment)
            .filter(Assessment.user_id == student.id)
            .order_by(Assessment.created_at.desc())
            .first()
        )
        
        assessment_count = db.query(Assessment).filter(Assessment.user_id == student.id).count()
        
        summary = {
            "id": student.id,
            "name": student.name,
            "email": student.email,
            "latest_risk_level": latest.risk_level if latest else None,
            "latest_risk_score": latest.risk_score if latest else None,
            "assessment_count": assessment_count,
            "last_assessment": latest.created_at if latest else None,
        }
        
        if risk_filter and latest:
            if latest.risk_level == risk_filter:
                result.append(summary)
        else:
            result.append(summary)
    
    return result


@router.get("/my-wellness")
async def get_my_wellness(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get personal wellness data for the student dashboard."""
    assessments = (
        db.query(Assessment)
        .filter(Assessment.user_id == user.id)
        .order_by(Assessment.created_at.asc())
        .all()
    )
    
    if not assessments:
        return {
            "assessments": [],
            "trends": {},
            "lifestyle_score": 0,
            "stress_score": 0,
            "digital_score": 0,
        }
    
    latest = assessments[-1]
    
    # Calculate lifestyle scores (0-100)
    sleep_score = min(100, max(0, (latest.sleep_duration / 8) * 100))
    exercise_score = min(100, max(0, (latest.physical_activity / 150) * 100))
    lifestyle_score = (sleep_score + exercise_score) / 2
    
    stress_score = max(0, 100 - (latest.stress_level * 10))
    
    digital_score = max(0, 100 - (latest.social_media_hours * 15))
    
    # Build trends
    trends = {
        "sleep": [{"date": a.created_at.isoformat(), "value": a.sleep_duration} for a in assessments],
        "study_hours": [{"date": a.created_at.isoformat(), "value": a.study_hours} for a in assessments],
        "stress": [{"date": a.created_at.isoformat(), "value": a.stress_level} for a in assessments],
        "risk": [{"date": a.created_at.isoformat(), "value": a.risk_score} for a in assessments],
    }
    
    return {
        "assessments": [AssessmentResponse.model_validate(a) for a in assessments],
        "trends": trends,
        "lifestyle_score": round(lifestyle_score, 1),
        "stress_score": round(stress_score, 1),
        "digital_score": round(digital_score, 1),
    }


@router.get("/admin/users")
async def get_system_users(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin"))
):
    """Get all users for admin management."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at,
            "is_active": u.is_active
        }
        for u in users
    ]


@router.put("/admin/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    role_data: UserRoleUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin"))
):
    """Update a user's role (admin only)."""
    if role_data.role not in ["student", "counselor", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'student', 'counselor', or 'admin'.")
        
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Prevent removing the last admin (basic safeguard)
    if target_user.role == "admin" and role_data.role != "admin":
        admin_count = db.query(User).filter(User.role == "admin").count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot demote the last remaining admin.")
            
    target_user.role = role_data.role
    db.commit()
    return {"message": f"Successfully updated user {target_user.email} to {role_data.role}"}


@router.get("/admin/counselors")
async def get_all_counselors(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin"))
):
    """Get all users with the counselor role for assignment dropdowns."""
    counselors = db.query(User).filter(User.role == "counselor", User.is_active == True).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email
        }
        for c in counselors
    ]


@router.put("/admin/users/{user_id}/counselor")
async def assign_counselor(
    user_id: int,
    assignment_data: UserCounselorUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin"))
):
    """Assign a student to a specific counselor."""
    student = db.query(User).filter(User.id == user_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found or user is not a student")
        
    if assignment_data.counselor_id is not None:
        counselor = db.query(User).filter(User.id == assignment_data.counselor_id, User.role == "counselor").first()
        if not counselor:
            raise HTTPException(status_code=400, detail="Target counselor not found or is not a valid counselor")
            
    student.counselor_id = assignment_data.counselor_id
    db.commit()
    return {"message": f"Successfully assigned counselor to student"}


@router.get("/student/{student_id}")
async def get_student_details(
    student_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("counselor", "admin"))
):
    """Get detailed history for a specific student (counselor/admin)."""
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    assessments = db.query(Assessment).filter(Assessment.user_id == student_id).order_by(Assessment.created_at.desc()).all()
    journals = db.query(JournalEntry).filter(JournalEntry.user_id == student_id).order_by(JournalEntry.created_at.desc()).all()
    
    # Fetch Counselor help logs and ratings
    help_logs = db.query(CounselorHelp).filter(CounselorHelp.student_id == student_id).order_by(CounselorHelp.created_at.desc()).all()
    ratings = db.query(CounselorRating).filter(CounselorRating.student_id == student_id).order_by(CounselorRating.created_at.desc()).all()
    
    return {
        "student": {
            "id": student.id, 
            "name": student.name, 
            "email": student.email,
            "counselor_id": student.counselor_id
        },
        "assessments": [AssessmentResponse.model_validate(a) for a in assessments],
        "journals": [JournalEntryResponse.model_validate(j) for j in journals],
        "help_logs": [CounselorHelpResponse.model_validate(h) for h in help_logs],
        "ratings": [CounselorRatingResponse.model_validate(r) for r in ratings]
    }


@router.get("/export")
async def export_user_data(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Export user's assessments and journals."""
    assessments = db.query(Assessment).filter(Assessment.user_id == user.id).all()
    journals = db.query(JournalEntry).filter(JournalEntry.user_id == user.id).all()
    
    return {
        "user_info": {
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "joined": user.created_at.isoformat()
        },
        "assessments": [AssessmentResponse.model_validate(a) for a in assessments],
        "journals": [JournalEntryResponse.model_validate(j) for j in journals]
    }

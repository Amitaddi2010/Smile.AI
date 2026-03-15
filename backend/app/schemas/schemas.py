"""
SMILE-AI Pydantic Schemas
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict
from datetime import datetime


# ── Auth Schemas ───────────────────────────────────────────
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=6)
    role: str = Field(default="student")


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    counselor_id: Optional[int] = None
    created_at: datetime
    is_active: bool = True
    wellness_level: int = 1
    wellness_points: int = 0

    class Config:
        from_attributes = True


class MissionCompletion(BaseModel):
    title: str


class UserRoleUpdate(BaseModel):
    role: str = Field(..., description="Role must be single string: student, counselor, or admin")


class UserCounselorUpdate(BaseModel):
    counselor_id: Optional[int] = Field(None, description="The ID of the counselor to assign to the student. Null removes assignment.")


class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[str] = Field(None, min_length=5)


class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ── Assessment Schemas ─────────────────────────────────────
class AssessmentInput(BaseModel):
    age: int = Field(..., ge=13, le=60)
    gender: str = Field(..., description="Male or Female")
    department: str = Field(..., description="e.g. Engineering, Science, Medical, Arts, Business")
    cgpa: float = Field(..., ge=0, le=4.0)
    sleep_duration: float = Field(..., ge=0, le=16)
    study_hours: float = Field(..., ge=0, le=18)
    social_media_hours: float = Field(..., ge=0, le=16)
    physical_activity: float = Field(..., ge=0, le=300)
    stress_level: int = Field(..., ge=1, le=10)
    
    # Extended fields
    screen_time: Optional[float] = None
    gaming_hours: Optional[float] = None
    financial_stress: Optional[int] = None
    family_history: Optional[bool] = None
    academic_pressure: Optional[int] = None
    
    # New Behavioral & Academic indicators
    gaming_behavior_score: Optional[int] = None
    social_media_addiction: Optional[int] = None
    academic_workload: Optional[int] = None
    peer_pressure: Optional[int] = None
    exam_anxiety: Optional[int] = None


class RiskFactor(BaseModel):
    feature: str
    value: float
    impact: str  # "high", "medium", "low"
    description: str


class PredictionResult(BaseModel):
    risk_score: float
    risk_level: str  # "low", "moderate", "high"
    depression_probability: float
    top_factors: List[RiskFactor]
    recommendations: List[str]
    assessment_id: Optional[int] = None


class AssessmentResponse(BaseModel):
    id: int
    created_at: datetime
    age: int
    gender: str
    department: str
    cgpa: float
    sleep_duration: float
    study_hours: float
    social_media_hours: float
    physical_activity: float
    stress_level: int
    risk_score: Optional[float]
    risk_level: Optional[str]
    depression_probability: Optional[float]
    top_factors: Optional[str]
    
    # Extended response fields
    screen_time: Optional[float] = None
    gaming_hours: Optional[float] = None
    financial_stress: Optional[int] = None
    family_history: Optional[bool] = None
    academic_pressure: Optional[int] = None
    gaming_behavior_score: Optional[int] = None
    social_media_addiction: Optional[int] = None
    academic_workload: Optional[int] = None
    peer_pressure: Optional[int] = None
    exam_anxiety: Optional[int] = None

    class Config:
        from_attributes = True


# ── Journal Schemas ────────────────────────────────────────
class JournalEntryInput(BaseModel):
    title: Optional[str] = None
    self_reported_mood: Optional[str] = None
    text_content: str = Field(..., min_length=10, description="The journal text to analyze")


class JournalEntryResponse(BaseModel):
    id: int
    created_at: datetime
    title: Optional[str] = None
    self_reported_mood: Optional[str] = None
    text_content: str
    smile_risk_index: Optional[float]
    risk_level: Optional[str]
    is_crisis: Optional[bool] = False
    fusion_details: Optional[str]

    class Config:
        from_attributes = True


# ── Dashboard Schemas ──────────────────────────────────────
class StudentSummary(BaseModel):
    id: int
    name: str
    email: str
    latest_risk_level: Optional[str]
    latest_risk_score: Optional[float]
    assessment_count: int
    last_assessment: Optional[datetime]


class DashboardStats(BaseModel):
    total_users: int
    total_assessments: int
    risk_distribution: Dict[str, int]
    avg_risk_score: float
    recent_assessments: List[AssessmentResponse]


# ── Counselor Schemas ──────────────────────────────────────
class CounselorRatingInput(BaseModel):
    counselor_id: int
    rating: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = None


class CounselorRatingResponse(BaseModel):
    id: int
    student_id: int
    counselor_id: int
    rating: int
    feedback: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class CounselorHelpInput(BaseModel):
    student_id: int
    activity_type: str = Field(..., min_length=2, max_length=100)
    notes: Optional[str] = None


class CounselorHelpResponse(BaseModel):
    id: int
    counselor_id: int
    student_id: int
    activity_type: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class CounselorPublicInfo(BaseModel):
    id: int
    name: str
    email: str
    role: str
    avg_rating: Optional[float] = 0.0
    rating_count: int = 0
    is_available: bool = True

    class Config:
        from_attributes = True


# ── Safe Space Schemas ─────────────────────────────────────
class SafeSpaceCommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)

class SafeSpaceCommentResponse(BaseModel):
    id: int
    post_id: int
    pseudonym: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class SafeSpacePostCreate(BaseModel):
    content: str = Field(..., min_length=10, max_length=2000)
    category: Optional[str] = "General"

class SafeSpacePostResponse(BaseModel):
    id: int
    pseudonym: str
    content: str
    category: Optional[str]
    is_flagged: bool
    likes: int
    created_at: datetime
    comment_count: int = 0
    comments: List[SafeSpaceCommentResponse] = []

    class Config:
        from_attributes = True

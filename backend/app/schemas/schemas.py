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
    created_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True


class UserRoleUpdate(BaseModel):
    role: str = Field(..., description="Role must be single string: student, counselor, or admin")


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
    text_content: str = Field(..., min_length=10, description="The journal text to analyze")


class JournalEntryResponse(BaseModel):
    id: int
    created_at: datetime
    text_content: str
    smile_risk_index: Optional[float]
    risk_level: Optional[str]
    is_crisis: bool
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


class ModelInfo(BaseModel):
    model_type: str
    accuracy: float
    auc_roc: float
    feature_importances: Dict[str, float]
    target_classes: List[str]
    n_train_samples: int
    n_test_samples: int

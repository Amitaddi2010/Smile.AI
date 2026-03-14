"""
SMILE-AI Database Models
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..database import Base


class UserRole(str, enum.Enum):
    STUDENT = "student"
    COUNSELOR = "counselor"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.STUDENT)
    counselor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    assessments = relationship("Assessment", back_populates="user")
    journals = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")
    
    # Relationships for Counselor features
    received_ratings = relationship("CounselorRating", foreign_keys="CounselorRating.counselor_id", back_populates="counselor")
    given_ratings = relationship("CounselorRating", foreign_keys="CounselorRating.student_id", back_populates="student")
    help_logs = relationship("CounselorHelp", foreign_keys="CounselorHelp.counselor_id", back_populates="counselor")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    title = Column(String(200), nullable=True)
    self_reported_mood = Column(String(50), nullable=True)
    text_content = Column(Text, nullable=False)
    
    # Fusion Results
    smile_risk_index = Column(Float, nullable=True)
    risk_level = Column(String(20), nullable=True)
    is_crisis = Column(Boolean, default=False)
    
    # Detailed JSON output from fusion
    fusion_details = Column(Text, nullable=True) 

    user = relationship("User", back_populates="journals")


class CounselorRating(Base):
    __tablename__ = "counselor_ratings"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    counselor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False) # 1-5
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", foreign_keys=[student_id], back_populates="given_ratings")
    counselor = relationship("User", foreign_keys=[counselor_id], back_populates="received_ratings")


class CounselorHelp(Base):
    """Tracks sessions or 'help' provided by a counselor to a student."""
    __tablename__ = "counselor_help_logs"

    id = Column(Integer, primary_key=True, index=True)
    counselor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_type = Column(String(100), nullable=False) # e.g., "Counseling Session", "Message Response"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    counselor = relationship("User", foreign_keys=[counselor_id], back_populates="help_logs")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Input features
    age = Column(Integer)
    gender = Column(String(20))
    department = Column(String(50))
    cgpa = Column(Float)
    sleep_duration = Column(Float)
    study_hours = Column(Float)
    social_media_hours = Column(Float)
    physical_activity = Column(Float)
    stress_level = Column(Integer)

    # Extended features (for richer form)
    screen_time = Column(Float, nullable=True)
    gaming_hours = Column(Float, nullable=True)
    financial_stress = Column(Integer, nullable=True)
    family_history = Column(Boolean, nullable=True)
    academic_pressure = Column(Integer, nullable=True) # Overall pressure
    
    # New detailed fields for diagnostic precision
    gaming_behavior_score = Column(Integer, nullable=True) # 1-10 scale
    social_media_addiction = Column(Integer, nullable=True) # 1-10 scale
    academic_workload = Column(Integer, nullable=True) # 1-10
    peer_pressure = Column(Integer, nullable=True) # 1-10
    exam_anxiety = Column(Integer, nullable=True) # 1-10

    # Prediction results
    risk_score = Column(Float)
    risk_level = Column(String(20))
    depression_probability = Column(Float)
    top_factors = Column(Text)  # JSON string

    user = relationship("User", back_populates="assessments")


class SafeSpacePost(Base):
    __tablename__ = "safe_space_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pseudonym = Column(String(50), nullable=False) # e.g. "Anonymous Panda"
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=True) # e.g. "Exam Stress", "Social Anxiety"
    
    # AI Moderation
    is_flagged = Column(Boolean, default=False)
    moderation_reason = Column(String(200), nullable=True)
    
    likes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    comments = relationship("SafeSpaceComment", back_populates="post", cascade="all, delete-orphan")


class SafeSpaceComment(Base):
    __tablename__ = "safe_space_comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("safe_space_posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pseudonym = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("SafeSpacePost", back_populates="comments")
    user = relationship("User")

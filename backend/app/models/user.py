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
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    assessments = relationship("Assessment", back_populates="user")
    journals = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    text_content = Column(Text, nullable=False)
    
    # Fusion Results
    smile_risk_index = Column(Float, nullable=True)
    risk_level = Column(String(20), nullable=True)
    is_crisis = Column(Boolean, default=False)
    
    # Detailed JSON output from fusion
    fusion_details = Column(Text, nullable=True) 

    user = relationship("User", back_populates="journals")


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

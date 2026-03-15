from app.database import SessionLocal
from app.models.user import User, Assessment, DailyMissionProgress
from datetime import datetime

db = SessionLocal()
try:
    user = db.query(User).filter(User.name == "test03").first()
    if not user:
        print("User test03 not found")
    else:
        print(f"User: {user.name}, Role: {user.role}, ID: {user.id}")
        assessments = db.query(Assessment).filter(Assessment.user_id == user.id).all()
        print(f"Assessments: {len(assessments)}")
        missions = db.query(DailyMissionProgress).filter(DailyMissionProgress.user_id == user.id).all()
        for a in assessments:
            print(f"Assessment ID: {a.id}, Risk Score: {a.risk_score}, Date: {a.created_at}")
        
        from app.routes.dashboard import mission_service
        missions_gen = mission_service.generate_missions(user.id, {"stress_level": assessments[0].stress_level} if assessments else None)
        print(f"Generated Missions count: {len(missions_gen)}")
finally:
    db.close()

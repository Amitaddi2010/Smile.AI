from app.database import SessionLocal
from app.models.user import DailyMissionProgress, Assessment, User
from app.services.mission_service import mission_service
from sqlalchemy import func
from datetime import datetime

db = SessionLocal()
try:
    user = db.query(User).filter(User.id == 12).first()
    latest_assessment = db.query(Assessment).filter(Assessment.user_id == user.id).order_by(Assessment.created_at.desc()).first()
    ad = None
    if latest_assessment:
        ad = {
            'stress_level': latest_assessment.stress_level,
            'sleep_duration': latest_assessment.sleep_duration,
            'academic_pressure': latest_assessment.academic_pressure
        }
    
    missions = mission_service.generate_missions(user_id=user.id, latest_assessment=ad)
    today = datetime.utcnow().date()
    completions = db.query(DailyMissionProgress).filter(
        DailyMissionProgress.user_id == user.id,
        func.date(DailyMissionProgress.completed_at) == today
    ).all()
    
    print('Completions Count:', len(completions))
    print('Completions Titles:', [c.mission_title for c in completions])
    
    completed_titles = {c.mission_title for c in completions}
    for m in missions:
        m['is_completed'] = m['title'] in completed_titles
    
    print('Missions Status:')
    for m in missions:
        print(f"- {m['title']}: {m['is_completed']}")
finally:
    db.close()

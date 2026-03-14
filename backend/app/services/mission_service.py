"""
SMILE-AI Mission Service
Generates personalized wellness missions based on clinical data.
"""
from typing import List, Dict
import random

class MissionService:
    def generate_missions(self, latest_assessment: Dict = None, latest_journal: Dict = None) -> List[Dict]:
        missions = []
        
        # Default fallback missions
        pool = [
            {"id": "m1", "title": "Mindful Breathing", "description": "Take 5 deep breaths before your next class.", "category": "Mindfulness", "reward": 10},
            {"id": "m2", "title": "Hydration Check", "description": "Drink a full glass of water right now.", "category": "Physical", "reward": 5},
            {"id": "m3", "title": "Quick Tidy", "description": "Organize your desk for 2 minutes.", "category": "Environment", "reward": 15},
            {"id": "m4", "title": "Positive Reframing", "description": "Write down one thing you're excited about today.", "category": "Mental", "reward": 20},
        ]

        # Personalized Logic
        if latest_assessment:
            # Case 1: High Stress
            if latest_assessment.get("stress_level", 0) >= 7:
                missions.append({
                    "id": "stress_1",
                    "title": "Unplug for 15m",
                    "description": "Put your phone in another room and sit in silence for 15 minutes.",
                    "category": "High Stress",
                    "reward": 50
                })
            
            # Case 2: Poor Sleep
            if latest_assessment.get("sleep_duration", 8) < 6:
               missions.append({
                    "id": "sleep_1",
                    "title": "Early Wind-down",
                    "description": "No screens 30 minutes before bed tonight.",
                    "category": "Sleep Recovery",
                    "reward": 40
                })

            # Case 3: High Academic Pressure
            if latest_assessment.get("academic_pressure", 0) >= 7:
               missions.append({
                    "id": "acad_1",
                    "title": "Priority List",
                    "description": "Write down only the top 3 most important tasks for today.",
                    "category": "Focus",
                    "reward": 30
                })

        # Fill with randoms if needed
        while len(missions) < 3:
            choice = random.choice(pool)
            if choice not in missions:
                missions.append(choice)

        return missions[:3]

mission_service = MissionService()

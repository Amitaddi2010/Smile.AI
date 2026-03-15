from ..models.user import User

def award_xp(user: User, amount: int):
    """Utility to handle multi-level up and point overflow."""
    user.wellness_points += amount
    while user.wellness_points >= 100:
        user.wellness_level += 1
        user.wellness_points -= 100

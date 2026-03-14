"""
SMILE-AI Safe Space Routes
Anonymous peer support with AI-assisted moderation.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
import random
from ..database import get_db
from ..models.user import User, SafeSpacePost, SafeSpaceComment
from ..schemas.schemas import (
    SafeSpacePostCreate, SafeSpacePostResponse,
    SafeSpaceCommentCreate, SafeSpaceCommentResponse
)
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/safe-space", tags=["Safe Space"])

ANIMALS = ["Panda", "Fox", "Koala", "Otter", "Tiger", "Owl", "Dolphin", "Wolf", "Deer", "Falcon"]
ADJECTIVES = ["Calm", "Brave", "Kind", "Silent", "Wise", "Resilient", "Bright", "Steady"]

def generate_pseudonym():
    return f"{random.choice(ADJECTIVES)} {random.choice(ANIMALS)}"

@router.post("/posts", response_model=SafeSpacePostResponse)
async def create_post(
    post_data: SafeSpacePostCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create an anonymous safe space post."""
    # Silent AI Moderation (Basic keyword filter for this prototype)
    # In production, this would call a real content safety API
    flag_keywords = ["kill", "die", "suicide", "hurt myself", "end it"]
    is_flagged = any(word in post_data.content.lower() for word in flag_keywords)
    
    new_post = SafeSpacePost(
        user_id=user.id,
        pseudonym=generate_pseudonym(),
        content=post_data.content,
        category=post_data.category,
        is_flagged=is_flagged,
        moderation_reason="Crisis language detected" if is_flagged else None
    )
    
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    return {
        **new_post.__dict__,
        "comment_count": 0,
        "comments": []
    }

@router.get("/posts", response_model=List[SafeSpacePostResponse])
async def get_posts(
    category: str = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Fetch recent safe space posts."""
    query = db.query(SafeSpacePost).filter(SafeSpacePost.is_flagged == False)
    if category:
        query = query.filter(SafeSpacePost.category == category)
    
    posts = query.order_by(SafeSpacePost.created_at.desc()).limit(50).all()
    
    result = []
    for post in posts:
        comments = db.query(SafeSpaceComment).filter(SafeSpaceComment.post_id == post.id).all()
        result.append({
            **post.__dict__,
            "comment_count": len(comments),
            "comments": [SafeSpaceCommentResponse.model_validate(c) for c in comments]
        })
    
    return result

@router.post("/posts/{post_id}/comments", response_model=SafeSpaceCommentResponse)
async def add_comment(
    post_id: int,
    comment_data: SafeSpaceCommentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Add an anonymous comment to a post."""
    post = db.query(SafeSpacePost).filter(SafeSpacePost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    new_comment = SafeSpaceComment(
        post_id=post_id,
        user_id=user.id,
        pseudonym=generate_pseudonym(),
        content=comment_data.content
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

@router.post("/posts/{post_id}/like")
async def like_post(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Like a post anonymously."""
    post = db.query(SafeSpacePost).filter(SafeSpacePost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    post.likes += 1
    db.commit()
    return {"likes": post.likes}

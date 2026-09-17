from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models import User, Submission, Assessment, Question, UserRole
from app.schemas import UserResponse
from app.core.dependencies import require_admin
from app.config import settings

router = APIRouter(prefix="/api/admin", tags=["Administration & Monitoring"])

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    total_users = db.query(User).count()
    total_questions = db.query(Question).count()
    total_submissions = db.query(Submission).count()
    
    assessments = db.query(Assessment).all()
    avg_band = round(sum(a.overall_band for a in assessments) / len(assessments), 1) if assessments else 0.0

    return {
        "total_users": total_users,
        "total_questions": total_questions,
        "total_submissions": total_submissions,
        "average_band": avg_band,
        "ai_gateway_provider": settings.AI_PROVIDER,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "openai_configured": bool(settings.OPENAI_API_KEY)
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(User).order_by(User.id.asc()).all()

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: UserRole,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.role = role
    db.commit()
    return {"message": "User role updated successfully", "new_role": role.value}

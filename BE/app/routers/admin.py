from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models import User, Submission, Assessment, Question, UserRole, Rubric, AIProfile, AssessmentJob, AuditLog, AssessmentJobStatus
from app.schemas import (
    UserResponse, RubricResponse, RubricCreate, RubricUpdate,
    AIProfileResponse, AIProfileCreate, AIProfileUpdate,
    AssessmentJobResponse, AuditLogResponse
)
from app.core.dependencies import require_admin
from app.config import settings
from app.services.cache import redis_status
from app.services.storage import object_storage_status

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
        "total_rubrics": db.query(Rubric).count(),
        "total_ai_profiles": db.query(AIProfile).count(),
        "pending_assessment_jobs": db.query(AssessmentJob).filter(
            AssessmentJob.status.in_([AssessmentJobStatus.QUEUED, AssessmentJobStatus.RUNNING])
        ).count(),
        "average_band": avg_band,
        "ai_gateway_provider": settings.AI_PROVIDER,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "openai_configured": bool(settings.OPENAI_API_KEY)
    }

@router.get("/rubrics", response_model=List[RubricResponse])
def get_rubrics(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(Rubric).order_by(Rubric.exam_type.asc(), Rubric.skill.asc(), Rubric.version.desc()).all()

@router.post("/rubrics", response_model=RubricResponse, status_code=status.HTTP_201_CREATED)
def create_rubric(
    payload: RubricCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    rubric = Rubric(**payload.model_dump())
    db.add(rubric)
    db.add(AuditLog(
        actor_user_id=admin.id,
        action="RUBRIC_CREATED",
        entity_type="Rubric",
        entity_id=None,
        metadata_json={"name": payload.name, "skill": payload.skill.value, "exam_type": payload.exam_type.value}
    ))
    db.commit()
    db.refresh(rubric)
    return rubric

@router.put("/rubrics/{rubric_id}", response_model=RubricResponse)
def update_rubric(
    rubric_id: int,
    payload: RubricUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    rubric = db.query(Rubric).filter(Rubric.id == rubric_id).first()
    if not rubric:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rubric not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(rubric, field, value)
    db.add(AuditLog(
        actor_user_id=admin.id,
        action="RUBRIC_UPDATED",
        entity_type="Rubric",
        entity_id=str(rubric.id),
        metadata_json=payload.model_dump(exclude_unset=True)
    ))
    db.commit()
    db.refresh(rubric)
    return rubric

@router.delete("/rubrics/{rubric_id}")
def delete_rubric(
    rubric_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    rubric = db.query(Rubric).filter(Rubric.id == rubric_id).first()
    if not rubric:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rubric not found")
    rubric.is_active = False
    db.add(AuditLog(
        actor_user_id=admin.id,
        action="RUBRIC_DEACTIVATED",
        entity_type="Rubric",
        entity_id=str(rubric.id),
        metadata_json={"name": rubric.name}
    ))
    db.commit()
    return {"message": "Rubric deactivated successfully"}

@router.get("/ai-profiles", response_model=List[AIProfileResponse])
def get_ai_profiles(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(AIProfile).order_by(AIProfile.purpose.asc(), AIProfile.name.asc()).all()

@router.post("/ai-profiles", response_model=AIProfileResponse, status_code=status.HTTP_201_CREATED)
def create_ai_profile(
    payload: AIProfileCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    profile = AIProfile(**payload.model_dump())
    db.add(profile)
    db.add(AuditLog(
        actor_user_id=admin.id,
        action="AI_PROFILE_CREATED",
        entity_type="AIProfile",
        entity_id=None,
        metadata_json={"name": payload.name, "provider": payload.provider, "purpose": payload.purpose}
    ))
    db.commit()
    db.refresh(profile)
    return profile

@router.put("/ai-profiles/{profile_id}", response_model=AIProfileResponse)
def update_ai_profile(
    profile_id: int,
    payload: AIProfileUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    profile = db.query(AIProfile).filter(AIProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="AI profile not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.add(AuditLog(
        actor_user_id=admin.id,
        action="AI_PROFILE_UPDATED",
        entity_type="AIProfile",
        entity_id=str(profile.id),
        metadata_json=payload.model_dump(exclude_unset=True)
    ))
    db.commit()
    db.refresh(profile)
    return profile

@router.delete("/ai-profiles/{profile_id}")
def delete_ai_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    profile = db.query(AIProfile).filter(AIProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="AI profile not found")
    profile.is_active = False
    db.add(AuditLog(
        actor_user_id=admin.id,
        action="AI_PROFILE_DEACTIVATED",
        entity_type="AIProfile",
        entity_id=str(profile.id),
        metadata_json={"name": profile.name}
    ))
    db.commit()
    return {"message": "AI profile deactivated successfully"}

@router.get("/infra/status")
def get_infra_status(admin: User = Depends(require_admin)):
    return {
        "redis": redis_status(),
        "object_storage": object_storage_status()
    }

@router.get("/assessment-jobs", response_model=List[AssessmentJobResponse])
def get_assessment_jobs(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(AssessmentJob).order_by(AssessmentJob.created_at.desc()).limit(100).all()

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()

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
    old_role = user.role.value
    user.role = role
    db.add(AuditLog(
        actor_user_id=admin.id,
        action="USER_ROLE_UPDATED",
        entity_type="User",
        entity_id=str(user.id),
        metadata_json={"old_role": old_role, "new_role": role.value}
    ))
    db.commit()
    return {"message": "User role updated successfully", "new_role": role.value}

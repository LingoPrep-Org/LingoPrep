from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Question, ExamType, SkillType, User
from app.schemas import QuestionCreate, QuestionUpdate, QuestionResponse
from app.core.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/api/questions", tags=["Question Bank"])

@router.get("", response_model=List[QuestionResponse])
def get_questions(
    exam_type: Optional[ExamType] = None,
    skill: Optional[SkillType] = None,
    part: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Question).filter(Question.is_active == True)
    if exam_type:
        query = query.filter(Question.exam_type == exam_type)
    if skill:
        query = query.filter(Question.skill == skill)
    if part:
        query = query.filter(Question.part == part)
    if difficulty:
        query = query.filter(Question.difficulty == difficulty)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Question.title.ilike(search_fmt)) |
            (Question.prompt.ilike(search_fmt)) |
            (Question.topic.ilike(search_fmt))
        )
    return query.order_by(Question.id.asc()).all()

@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(question_id: int, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return q

@router.post("", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question(
    q_in: QuestionCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    new_q = Question(**q_in.model_dump())
    db.add(new_q)
    db.commit()
    db.refresh(new_q)
    return new_q

@router.put("/{question_id}", response_model=QuestionResponse)
def update_question(
    question_id: int,
    q_in: QuestionUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    
    update_data = q_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(q, field, value)
    
    db.commit()
    db.refresh(q)
    return q

@router.delete("/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    q.is_active = False # soft delete
    db.commit()
    return {"message": "Question deactivated successfully"}

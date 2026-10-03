from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.ai.cefr_mapper import ielts_band_to_cefr
from app.core.dependencies import require_teacher
from app.database import get_db
from app.models import Question, SkillType, Submission, SubmissionStatus, TeacherAssignment, User, UserRole
from app.schemas import (
    TeacherAssignmentResponse,
    TeacherAssignmentSubmissionResponse,
    TeacherStudentProgressResponse,
    TeacherAssignmentCreate,
    TeacherAssignmentUpdate,
)

router = APIRouter(prefix="/api/teacher", tags=["Teacher Analytics"])


@router.get("/assignments", response_model=List[TeacherAssignmentResponse])
def get_teacher_assignments(
    db: Session = Depends(get_db),
    teacher: User = Depends(require_teacher),
):
    assignments = db.query(TeacherAssignment).filter(TeacherAssignment.teacher_id == teacher.id).order_by(TeacherAssignment.created_at.desc()).all()
    result = []
    for assignment in assignments:
        question = assignment.question
        learners = db.query(User).filter(User.id.in_(assignment.learner_ids or [])).all() if assignment.learner_ids else []
        submitted_count = db.query(Submission).filter(Submission.question_id == question.id, Submission.user_id.in_(assignment.learner_ids or [])).count() if assignment.learner_ids else 0
        result.append(TeacherAssignmentResponse(
            id=assignment.id, question_id=question.id, name=assignment.name,
            description=assignment.description or "", skill=question.skill,
            part=question.part, question_content=question.prompt,
            learner_ids=assignment.learner_ids or [], learner_names=[u.full_name for u in learners],
            start_date=assignment.start_date, due_date=assignment.due_date,
            duration=assignment.duration, status=assignment.status,
            total_learners=len(assignment.learner_ids or []), submitted_count=submitted_count,
        ))
    return result


def _validate_assignment_payload(payload, db):
    question = db.query(Question).filter(Question.id == payload.question_id, Question.is_active == True).first()
    if not question:
        raise HTTPException(status_code=404, detail="Active question not found")
    learners = db.query(User).filter(User.id.in_(payload.learner_ids), User.role == UserRole.LEARNER, User.is_active == True).all()
    if not payload.learner_ids or len(learners) != len(set(payload.learner_ids)):
        raise HTTPException(status_code=400, detail="Select at least one valid learner")
    if payload.duration < 1:
        raise HTTPException(status_code=400, detail="Duration must be positive")
    if payload.status not in {"DRAFT", "ACTIVE", "COMPLETED"}:
        raise HTTPException(status_code=400, detail="Invalid assignment status")
    return question


@router.post("/assignments", response_model=TeacherAssignmentResponse, status_code=201)
def create_teacher_assignment(payload: TeacherAssignmentCreate, db: Session = Depends(get_db), teacher: User = Depends(require_teacher)):
    question = _validate_assignment_payload(payload, db)
    assignment = TeacherAssignment(teacher_id=teacher.id, question_id=question.id, name=payload.name, description=payload.description, learner_ids=payload.learner_ids, start_date=payload.start_date, due_date=payload.due_date, duration=payload.duration, status=payload.status)
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return TeacherAssignmentResponse(id=assignment.id, question_id=question.id, name=assignment.name, description=assignment.description, skill=question.skill, part=question.part, question_content=question.prompt, learner_ids=assignment.learner_ids, learner_names=[u.full_name for u in db.query(User).filter(User.id.in_(assignment.learner_ids)).all()], start_date=assignment.start_date, due_date=assignment.due_date, duration=assignment.duration, status=assignment.status, total_learners=len(assignment.learner_ids), submitted_count=0)


@router.put("/assignments/{assignment_id}", response_model=TeacherAssignmentResponse)
def update_teacher_assignment(assignment_id: int, payload: TeacherAssignmentUpdate, db: Session = Depends(get_db), teacher: User = Depends(require_teacher)):
    assignment = db.query(TeacherAssignment).filter(TeacherAssignment.id == assignment_id, TeacherAssignment.teacher_id == teacher.id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    question = _validate_assignment_payload(payload, db)
    for key in ("question_id", "name", "description", "learner_ids", "start_date", "due_date", "duration", "status"):
        setattr(assignment, key, getattr(payload, key))
    db.commit()
    db.refresh(assignment)
    learners = db.query(User).filter(User.id.in_(assignment.learner_ids)).all()
    submitted_count = db.query(Submission).filter(Submission.question_id == question.id, Submission.user_id.in_(assignment.learner_ids)).count()
    return TeacherAssignmentResponse(id=assignment.id, question_id=question.id, name=assignment.name, description=assignment.description, skill=question.skill, part=question.part, question_content=question.prompt, learner_ids=assignment.learner_ids, learner_names=[u.full_name for u in learners], start_date=assignment.start_date, due_date=assignment.due_date, duration=assignment.duration, status=assignment.status, total_learners=len(assignment.learner_ids), submitted_count=submitted_count)


@router.delete("/assignments/{assignment_id}", status_code=204)
def delete_teacher_assignment(assignment_id: int, db: Session = Depends(get_db), teacher: User = Depends(require_teacher)):
    assignment = db.query(TeacherAssignment).filter(TeacherAssignment.id == assignment_id, TeacherAssignment.teacher_id == teacher.id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(assignment)
    db.commit()


@router.get("/assignments/{assignment_id}/submissions", response_model=List[TeacherAssignmentSubmissionResponse])
def get_teacher_assignment_submissions(
    assignment_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(require_teacher),
):
    assignment = db.query(TeacherAssignment).filter(TeacherAssignment.id == assignment_id, TeacherAssignment.teacher_id == teacher.id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    submissions = db.query(Submission).filter(Submission.question_id == assignment.question_id, Submission.user_id.in_(assignment.learner_ids or [])).order_by(Submission.created_at.desc()).all()
    by_learner = {sub.user_id: sub for sub in submissions}
    learners = db.query(User).filter(User.id.in_(assignment.learner_ids or [])).all()
    return [TeacherAssignmentSubmissionResponse(
        id=by_learner[learner.id].id if learner.id in by_learner else -learner.id,
        learner_id=learner.id, learner_name=learner.full_name,
        status=by_learner[learner.id].status if learner.id in by_learner else SubmissionStatus.PENDING,
        score=by_learner[learner.id].assessment.overall_band if learner.id in by_learner and by_learner[learner.id].assessment else None,
        cefr=by_learner[learner.id].assessment.overall_cefr if learner.id in by_learner and by_learner[learner.id].assessment else None,
        submitted_at=by_learner[learner.id].created_at if learner.id in by_learner else None,
        skill=assignment.question.skill,
    ) for learner in learners]


@router.get("/students/progress", response_model=List[TeacherStudentProgressResponse])
def get_teacher_students_progress(
    db: Session = Depends(get_db),
    teacher: User = Depends(require_teacher),
):
    learners = db.query(User).filter(User.role == UserRole.LEARNER, User.is_active == True).order_by(User.id.asc()).all()
    result = []
    for learner in learners:
        submissions = db.query(Submission).filter(Submission.user_id == learner.id).all()
        speaking = [s.assessment.overall_band for s in submissions if s.submission_type == SkillType.SPEAKING and s.assessment]
        writing = [s.assessment.overall_band for s in submissions if s.submission_type == SkillType.WRITING and s.assessment]
        scores = speaking + writing
        average = round(sum(scores) / len(scores), 1) if scores else 0.0
        result.append(
            TeacherStudentProgressResponse(
                id=learner.id,
                name=learner.full_name,
                email=learner.email,
                joined_at=learner.created_at,
                total_submissions=len(submissions),
                speaking_count=sum(1 for s in submissions if s.submission_type == SkillType.SPEAKING),
                writing_count=sum(1 for s in submissions if s.submission_type == SkillType.WRITING),
                speaking_score=round(sum(speaking) / len(speaking), 1) if speaking else 0.0,
                writing_score=round(sum(writing) / len(writing), 1) if writing else 0.0,
                average_band=average,
                cefr=ielts_band_to_cefr(average) if scores else "A1",
                status="IMPROVING" if len(scores) >= 3 else "PRACTICING",
            )
        )
    return result

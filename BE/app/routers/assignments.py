import re
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models import Submission, TeacherAssignment, User
from app.schemas import LearnerAssignmentResponse

router = APIRouter(prefix="/api/assignments", tags=["Learner Assignments"])


@router.get("", response_model=List[LearnerAssignmentResponse])
def get_learner_assignments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    submissions = (
        db.query(Submission)
        .filter(Submission.user_id == current_user.id)
        .order_by(Submission.created_at.desc())
        .all()
    )
    latest_by_question = {}
    for submission in submissions:
        latest_by_question.setdefault(submission.question_id, submission)

    assignments = []
    saved_assignments = db.query(TeacherAssignment).filter(
        TeacherAssignment.status == "ACTIVE"
    ).order_by(TeacherAssignment.start_date.desc()).all()
    for assignment in saved_assignments:
        if current_user.id not in (assignment.learner_ids or []):
            continue
        question = assignment.question
        submission = latest_by_question.get(question.id)
        match = re.search(r"(\d+)", question.part)
        task_number = int(match.group(1)) if match else 1
        duration_minutes = max(1, round((question.time_limit_seconds or 0) / 60))
        assignments.append(
            LearnerAssignmentResponse(
                id=assignment.id,
                question_id=question.id,
                title=assignment.name,
                skill=question.skill,
                part=question.part,
                task_number=task_number,
                description=assignment.description or question.prompt,
                teacher_name=assignment.teacher.full_name,
                assigned_at=assignment.start_date,
                deadline=assignment.due_date,
                duration=f"~{duration_minutes} phút",
                status="SUBMITTED" if submission else "NOT_STARTED",
                progress=100 if submission else 0,
                submission_id=submission.id if submission else None,
            )
        )
    return assignments

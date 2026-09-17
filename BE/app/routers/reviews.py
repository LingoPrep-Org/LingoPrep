from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import (
    Submission, SubmissionStatus, TeacherReview, User, Notification
)
from app.schemas import (
    SubmissionResponse, TeacherReviewCreate, TeacherReviewResponse
)
from app.core.dependencies import require_teacher, get_current_user

router = APIRouter(prefix="/api/reviews", tags=["Teacher Review Module"])

@router.get("/queue", response_model=List[SubmissionResponse])
def get_review_queue(
    db: Session = Depends(get_db),
    teacher: User = Depends(require_teacher)
):
    """
    Returns submissions that need teacher review or have been completed recently.
    Prioritizes REVIEW_REQUESTED submissions.
    """
    queue = db.query(Submission).filter(
        Submission.status.in_([
            SubmissionStatus.REVIEW_REQUESTED,
            SubmissionStatus.EVALUATED,
            SubmissionStatus.REVIEWED
        ])
    ).order_by(
        Submission.status == SubmissionStatus.REVIEW_REQUESTED,
        Submission.created_at.desc()
    ).all()
    return queue

@router.post("/{submission_id}", response_model=TeacherReviewResponse)
def submit_teacher_review(
    submission_id: int,
    review_in: TeacherReviewCreate,
    db: Session = Depends(get_db),
    teacher: User = Depends(require_teacher)
):
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")

    existing_review = db.query(TeacherReview).filter(TeacherReview.submission_id == submission_id).first()
    
    # Check if scores differ from AI assessment
    ai_band = sub.assessment.overall_band if sub.assessment else review_in.overall_band
    is_overridden = abs(ai_band - review_in.overall_band) >= 0.25

    if existing_review:
        existing_review.overall_band = review_in.overall_band
        existing_review.overall_cefr = review_in.overall_cefr
        existing_review.criteria_scores = review_in.criteria_scores
        existing_review.teacher_notes = review_in.teacher_notes
        existing_review.is_overridden = is_overridden
        existing_review.reviewed_at = datetime.utcnow()
        review = existing_review
    else:
        review = TeacherReview(
            submission_id=sub.id,
            teacher_id=teacher.id,
            overall_band=review_in.overall_band,
            overall_cefr=review_in.overall_cefr,
            criteria_scores=review_in.criteria_scores,
            teacher_notes=review_in.teacher_notes,
            is_overridden=is_overridden
        )
        db.add(review)

    sub.status = SubmissionStatus.REVIEWED
    
    # Notify learner
    notif = Notification(
        user_id=sub.user_id,
        title="Teacher Review Ready",
        message=f"Examiner {teacher.full_name} reviewed your submission (Band {review_in.overall_band}).",
        type="TEACHER_REVIEWED",
        link=f"/assessment/{sub.id}"
    )
    db.add(notif)
    db.commit()
    db.refresh(review)

    return TeacherReviewResponse(
        id=review.id,
        submission_id=review.submission_id,
        teacher_id=review.teacher_id,
        teacher_name=teacher.full_name,
        overall_band=review.overall_band,
        overall_cefr=review.overall_cefr,
        criteria_scores=review.criteria_scores,
        teacher_notes=review.teacher_notes,
        is_overridden=review.is_overridden,
        reviewed_at=review.reviewed_at
    )

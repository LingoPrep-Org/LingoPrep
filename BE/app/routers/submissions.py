import os
import uuid
import logging
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    Submission, SubmissionStatus, Question, Assessment, User, SkillType, Notification
)
from app.schemas import (
    SubmissionResponse, SubmissionCreateWriting
)
from app.core.dependencies import get_current_user
from app.config import settings
from app.ai.writing_evaluator import WritingEvaluator
from app.ai.speaking_evaluator import SpeakingEvaluator
from app.ai.stt_service import STTService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/submissions", tags=["Submissions & Assessments"])

@router.post("/writing", response_model=SubmissionResponse)
async def submit_writing(
    body: SubmissionCreateWriting,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = db.query(Question).filter(Question.id == body.question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    
    words = body.content_text.strip().split()
    word_count = len(words)

    # 1. Create Submission record
    sub = Submission(
        user_id=current_user.id,
        question_id=question.id,
        submission_type=SkillType.WRITING,
        content_text=body.content_text.strip(),
        word_count=word_count,
        status=SubmissionStatus.PROCESSING
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    # 2. Trigger AI Writing Evaluation
    try:
        eval_result = await WritingEvaluator.evaluate(
            exam_type=question.exam_type.value,
            part=question.part,
            prompt=question.prompt,
            essay_text=body.content_text.strip(),
            min_words=question.min_words or 150
        )

        # 3. Create Assessment record
        assessment = Assessment(
            submission_id=sub.id,
            overall_band=eval_result["overall_band"],
            overall_cefr=eval_result["overall_cefr"],
            task_response_score=eval_result.get("task_response_score"),
            coherence_score=eval_result.get("coherence_score"),
            lexical_score=eval_result.get("lexical_score"),
            grammar_score=eval_result.get("grammar_score"),
            criteria_breakdown=eval_result.get("criteria_breakdown"),
            strengths=eval_result.get("strengths", []),
            weaknesses=eval_result.get("weaknesses", []),
            inline_feedback=eval_result.get("inline_feedback", []),
            model_answer=eval_result.get("model_answer"),
            recommendations=eval_result.get("recommendations", [])
        )
        db.add(assessment)
        sub.status = SubmissionStatus.EVALUATED
        
        # 4. Create Notification
        notif = Notification(
            user_id=current_user.id,
            title="Writing Evaluated by AI",
            message=f"Your submission for '{question.title}' received Band {eval_result['overall_band']} ({eval_result['overall_cefr']}).",
            type="EVALUATION_COMPLETED",
            link=f"/assessment/{sub.id}"
        )
        db.add(notif)
        db.commit()
        db.refresh(sub)

    except Exception as e:
        logger.error(f"Error during AI Writing Evaluation: {e}")
        sub.status = SubmissionStatus.PENDING
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Evaluation failed: {str(e)}"
        )

    return sub

@router.post("/speaking", response_model=SubmissionResponse)
async def submit_speaking(
    question_id: int = Form(...),
    duration_seconds: int = Form(60),
    transcript: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    # Save audio file if uploaded
    saved_audio_path = None
    if audio_file:
        file_ext = os.path.splitext(audio_file.filename)[1] or ".webm"
        file_name = f"audio_{uuid.uuid4().hex}{file_ext}"
        saved_audio_path = os.path.join(settings.UPLOAD_DIR, file_name)
        with open(saved_audio_path, "wb") as f:
            content = await audio_file.read()
            f.write(content)

    # 1. Speech-To-Text processing
    stt_result = await STTService.transcribe_audio(
        file_path=saved_audio_path or "",
        provided_transcript=transcript
    )
    final_transcript = stt_result["transcript"]
    wpm = stt_result.get("speaking_rate_wpm", 120.0)
    word_count = stt_result.get("word_count", len(final_transcript.split()))

    # 2. Create Submission
    sub = Submission(
        user_id=current_user.id,
        question_id=question.id,
        submission_type=SkillType.SPEAKING,
        content_text=final_transcript,
        audio_path=f"/uploads/{os.path.basename(saved_audio_path)}" if saved_audio_path else None,
        duration_seconds=duration_seconds,
        word_count=word_count,
        status=SubmissionStatus.PROCESSING
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    # 3. AI Speaking Evaluation
    try:
        eval_result = await SpeakingEvaluator.evaluate(
            exam_type=question.exam_type.value,
            part=question.part,
            prompt=question.prompt,
            transcript=final_transcript,
            duration_seconds=duration_seconds,
            speaking_rate_wpm=wpm
        )

        assessment = Assessment(
            submission_id=sub.id,
            overall_band=eval_result["overall_band"],
            overall_cefr=eval_result["overall_cefr"],
            fluency_score=eval_result.get("fluency_score"),
            lexical_score=eval_result.get("lexical_score"),
            grammar_score=eval_result.get("grammar_score"),
            pronunciation_score=eval_result.get("pronunciation_score"),
            criteria_breakdown=eval_result.get("criteria_breakdown"),
            strengths=eval_result.get("strengths", []),
            weaknesses=eval_result.get("weaknesses", []),
            inline_feedback=eval_result.get("inline_feedback", []),
            model_answer=eval_result.get("model_answer"),
            recommendations=eval_result.get("recommendations", [])
        )
        db.add(assessment)
        sub.status = SubmissionStatus.EVALUATED

        notif = Notification(
            user_id=current_user.id,
            title="Speaking Evaluated by AI",
            message=f"Your speaking recording for '{question.title}' received Band {eval_result['overall_band']} ({eval_result['overall_cefr']}).",
            type="EVALUATION_COMPLETED",
            link=f"/assessment/{sub.id}"
        )
        db.add(notif)
        db.commit()
        db.refresh(sub)

    except Exception as e:
        logger.error(f"Error during AI Speaking Evaluation: {e}")
        sub.status = SubmissionStatus.PENDING
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Evaluation failed: {str(e)}"
        )

    return sub

@router.get("", response_model=List[SubmissionResponse])
def get_my_submissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Submission).filter(
        Submission.user_id == current_user.id
    ).order_by(Submission.created_at.desc()).all()

@router.get("/{submission_id}", response_model=SubmissionResponse)
def get_submission(
    submission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    return sub

@router.post("/{submission_id}/request-review")
def request_teacher_review(
    submission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(Submission).filter(
        Submission.id == submission_id,
        Submission.user_id == current_user.id
    ).first()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    
    sub.status = SubmissionStatus.REVIEW_REQUESTED
    db.commit()
    return {"message": "Teacher review requested successfully", "status": sub.status.value}

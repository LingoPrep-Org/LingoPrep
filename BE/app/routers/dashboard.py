from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from collections import defaultdict
from app.database import get_db
from app.models import Submission, Assessment, Question, Notification, User, SkillType
from app.schemas import (
    LearnerDashboardStats, SkillRadarItem, TrendPoint, QuestionResponse, NotificationResponse,
    LearnerProgressResponse, LearnerProgressItem, LearnerSkillAnalysisItem,
    LearnerRecentActivityItem, LearnerWeeklyActivityItem
)
from app.core.dependencies import get_current_user
from app.ai.cefr_mapper import ielts_band_to_cefr

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard & Analytics"])

@router.get("/learner", response_model=LearnerDashboardStats)
def get_learner_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    submissions = db.query(Submission).filter(
        Submission.user_id == current_user.id
    ).order_by(Submission.created_at.asc()).all()

    total_submissions = len(submissions)
    speaking_count = sum(1 for s in submissions if s.submission_type == SkillType.SPEAKING)
    writing_count = sum(1 for s in submissions if s.submission_type == SkillType.WRITING)

    evaluated_subs = [s for s in submissions if s.assessment is not None]
    
    bands = [s.assessment.overall_band for s in evaluated_subs]
    avg_band = round(sum(bands) / len(bands), 1) if bands else 6.0
    highest_band = max(bands) if bands else 6.0
    cefr = ielts_band_to_cefr(avg_band)

    total_seconds = sum(s.duration_seconds for s in submissions)
    total_minutes = max(15, round(total_seconds / 60))

    # Calculate Skill Radar
    fc_scores = [s.assessment.fluency_score for s in evaluated_subs if s.assessment.fluency_score]
    cc_scores = [s.assessment.coherence_score for s in evaluated_subs if s.assessment.coherence_score]
    lr_scores = [s.assessment.lexical_score for s in evaluated_subs if s.assessment.lexical_score]
    gra_scores = [s.assessment.grammar_score for s in evaluated_subs if s.assessment.grammar_score]
    pr_scores = [s.assessment.pronunciation_score for s in evaluated_subs if s.assessment.pronunciation_score]
    tr_scores = [s.assessment.task_response_score for s in evaluated_subs if s.assessment.task_response_score]

    def avg_or_default(lst, default=6.5):
        return round(sum(lst) / len(lst), 1) if lst else default

    skill_radar = [
        SkillRadarItem(skill_name="Fluency", score=avg_or_default(fc_scores, 6.5)),
        SkillRadarItem(skill_name="Coherence", score=avg_or_default(cc_scores, 7.0)),
        SkillRadarItem(skill_name="Lexical Resource", score=avg_or_default(lr_scores, 7.0)),
        SkillRadarItem(skill_name="Grammar", score=avg_or_default(gra_scores, 6.5)),
        SkillRadarItem(skill_name="Pronunciation", score=avg_or_default(pr_scores, 6.5)),
        SkillRadarItem(skill_name="Task Response", score=avg_or_default(tr_scores, 7.0)),
    ]

    # Trend History
    trend_history = []
    for s in evaluated_subs:
        trend_history.append(
            TrendPoint(
                date=s.created_at.strftime("%b %d"),
                band=s.assessment.overall_band,
                type=s.submission_type.value
            )
        )
    if not trend_history:
        trend_history = [
            TrendPoint(date="Day 1", band=6.0, type="WRITING"),
            TrendPoint(date="Day 3", band=6.5, type="SPEAKING"),
            TrendPoint(date="Day 7", band=7.0, type="WRITING"),
            TrendPoint(date="Today", band=avg_band, type="AVERAGE")
        ]

    # Recommended questions (practice weak skills)
    recommended = db.query(Question).filter(Question.is_active == True).limit(3).all()

    return LearnerDashboardStats(
        total_submissions=total_submissions,
        speaking_count=speaking_count,
        writing_count=writing_count,
        average_band=avg_band,
        highest_band=highest_band,
        cefr_level=cefr,
        current_streak_days=max(1, (datetime.utcnow() - current_user.created_at).days + 1),
        total_practiced_minutes=total_minutes,
        skill_radar=skill_radar,
        trend_history=trend_history,
        recommended_questions=[QuestionResponse.model_validate(q) for q in recommended]
    )


@router.get("/learner/progress", response_model=LearnerProgressResponse)
def get_learner_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    submissions = (
        db.query(Submission)
        .filter(Submission.user_id == current_user.id)
        .order_by(Submission.created_at.asc())
        .all()
    )
    evaluated = [submission for submission in submissions if submission.assessment]
    scores = [submission.assessment.overall_band for submission in evaluated]
    speaking = [submission for submission in evaluated if submission.submission_type == SkillType.SPEAKING]
    writing = [submission for submission in evaluated if submission.submission_type == SkillType.WRITING]

    def average(items):
        return round(sum(items) / len(items), 1) if items else 0.0

    def grouped_progress(items):
        grouped = defaultdict(list)
        for submission in items:
            grouped[submission.question.part if submission.question else "Unknown"].append(
                submission.assessment.overall_band
            )
        return [
            LearnerProgressItem(label=label, practices=len(values), avg_score=average(values))
            for label, values in grouped.items()
        ]

    speaking_metrics = {
        "Fluency": [s.assessment.fluency_score for s in speaking if s.assessment.fluency_score is not None],
        "Coherence": [s.assessment.coherence_score for s in speaking if s.assessment.coherence_score is not None],
        "Lexical Resource": [s.assessment.lexical_score for s in speaking if s.assessment.lexical_score is not None],
        "Pronunciation": [s.assessment.pronunciation_score for s in speaking if s.assessment.pronunciation_score is not None],
    }
    writing_metrics = {
        "Task Response": [s.assessment.task_response_score for s in writing if s.assessment.task_response_score is not None],
        "Grammar": [s.assessment.grammar_score for s in writing if s.assessment.grammar_score is not None],
        "Vocabulary": [s.assessment.lexical_score for s in writing if s.assessment.lexical_score is not None],
        "Coherence": [s.assessment.coherence_score for s in writing if s.assessment.coherence_score is not None],
    }

    def analysis(metrics):
        return [
            LearnerSkillAnalysisItem(criterion=name, percentage=round(average(values) / 9 * 100, 1) if values else 0)
            for name, values in metrics.items()
        ]

    trend_history = [
        TrendPoint(
            date=submission.created_at.strftime("%b %d"),
            band=submission.assessment.overall_band,
            type=submission.submission_type.value,
        )
        for submission in evaluated
    ]
    weekly_start = datetime.utcnow() - timedelta(days=7)
    weekly_completed = sum(1 for submission in submissions if submission.created_at >= weekly_start)
    target_score = float(current_user.target_score or 7.0)
    weekly_activity = []
    for day_offset in range(6, -1, -1):
        day = (datetime.utcnow() - timedelta(days=day_offset)).date()
        day_submissions = [s for s in submissions if s.created_at.date() == day]
        weekly_activity.append(
            LearnerWeeklyActivityItem(
                date=day.strftime("%d/%m"),
                practiced=len(day_submissions),
                speaking=sum(1 for s in day_submissions if s.submission_type == SkillType.SPEAKING),
                writing=sum(1 for s in day_submissions if s.submission_type == SkillType.WRITING),
                total_minutes=round(sum(s.duration_seconds for s in day_submissions) / 60),
            )
        )

    return LearnerProgressResponse(
        total_practices=len(submissions),
        speaking_practices=sum(1 for s in submissions if s.submission_type == SkillType.SPEAKING),
        writing_practices=sum(1 for s in submissions if s.submission_type == SkillType.WRITING),
        average_band=average(scores),
        speaking_average=average([s.assessment.overall_band for s in speaking]),
        writing_average=average([s.assessment.overall_band for s in writing]),
        current_cefr=ielts_band_to_cefr(average(scores)) if scores else "A1",
        target_cefr=ielts_band_to_cefr(target_score),
        overall_progress=round(min(100, len(submissions) / 20 * 100), 1),
        trend_history=trend_history,
        speaking_parts=grouped_progress(speaking),
        writing_tasks=grouped_progress(writing),
        speaking_skill_analysis=analysis(speaking_metrics),
        writing_skill_analysis=analysis(writing_metrics),
        recent_activity=[
            LearnerRecentActivityItem(
                id=submission.id,
                skill=submission.submission_type,
                part=submission.question.part if submission.question else "Unknown",
                score=submission.assessment.overall_band,
                cefr=submission.assessment.overall_cefr,
                created_at=submission.created_at,
            )
            for submission in evaluated[-10:][::-1]
        ],
        weekly_activity=weekly_activity,
        weekly_completed=weekly_completed,
        weekly_goal=5,
    )

@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(20).all()

@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "ok"}

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models import UserRole, ExamType, SkillType, SubmissionStatus

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserResponse"

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.LEARNER
    target_exam: Optional[str] = "IELTS"
    target_score: Optional[str] = "7.0"

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Question Schemas
class QuestionBase(BaseModel):
    exam_type: ExamType
    skill: SkillType
    part: str
    title: str
    topic: Optional[str] = "General"
    difficulty: Optional[str] = "Medium"
    prompt: str
    instructions: Optional[str] = None
    image_url: Optional[str] = None
    prep_time_seconds: Optional[int] = 60
    time_limit_seconds: Optional[int] = 120
    min_words: Optional[int] = None
    max_words: Optional[int] = None
    sample_answer: Optional[str] = None
    rubric_criteria: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = []
    is_active: Optional[bool] = True

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    prompt: Optional[str] = None
    instructions: Optional[str] = None
    image_url: Optional[str] = None
    time_limit_seconds: Optional[int] = None
    min_words: Optional[int] = None
    max_words: Optional[int] = None
    sample_answer: Optional[str] = None
    difficulty: Optional[str] = None
    is_active: Optional[bool] = None

class QuestionResponse(QuestionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Assessment Schemas
class InlineFeedbackItem(BaseModel):
    original: str
    improved: str
    explanation: str
    category: Optional[str] = "Grammar" # Grammar, Vocabulary, Style, Cohesion

class CriteriaScore(BaseModel):
    score: float
    name: str
    feedback: str
    cefr: Optional[str] = None

class AssessmentResponse(BaseModel):
    id: int
    submission_id: int
    overall_band: float
    overall_cefr: str
    fluency_score: Optional[float] = None
    lexical_score: Optional[float] = None
    grammar_score: Optional[float] = None
    pronunciation_score: Optional[float] = None
    task_response_score: Optional[float] = None
    coherence_score: Optional[float] = None
    criteria_breakdown: Optional[Dict[str, Any]] = None
    strengths: List[str] = []
    weaknesses: List[str] = []
    inline_feedback: List[Dict[str, Any]] = []
    model_answer: Optional[str] = None
    recommendations: List[str] = []
    evaluated_at: datetime

    class Config:
        from_attributes = True

# Teacher Review Schemas
class TeacherReviewCreate(BaseModel):
    overall_band: float
    overall_cefr: str
    criteria_scores: Optional[Dict[str, Any]] = None
    teacher_notes: str

class TeacherReviewResponse(BaseModel):
    id: int
    submission_id: int
    teacher_id: int
    teacher_name: Optional[str] = None
    overall_band: float
    overall_cefr: str
    criteria_scores: Optional[Dict[str, Any]] = None
    teacher_notes: str
    is_overridden: bool
    reviewed_at: datetime

    class Config:
        from_attributes = True

# Submission Schemas
class SubmissionCreateWriting(BaseModel):
    question_id: int
    content_text: str

class SubmissionResponse(BaseModel):
    id: int
    user_id: int
    question_id: int
    submission_type: SkillType
    content_text: Optional[str] = None
    audio_path: Optional[str] = None
    duration_seconds: int
    word_count: int
    status: SubmissionStatus
    created_at: datetime
    updated_at: datetime
    question: Optional[QuestionResponse] = None
    assessment: Optional[AssessmentResponse] = None
    teacher_review: Optional[TeacherReviewResponse] = None

    class Config:
        from_attributes = True

# Chatbot Schemas
class ChatSessionCreate(BaseModel):
    title: Optional[str] = "Practice Session"
    persona: Optional[str] = "IELTS_EXAMINER"

class ChatMessageCreate(BaseModel):
    content: str
    audio_path: Optional[str] = None

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    audio_path: Optional[str] = None
    corrections: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    id: int
    title: str
    persona: str
    created_at: datetime
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True

# Dashboard & Analytics Schemas
class SkillRadarItem(BaseModel):
    skill_name: str
    score: float
    max_score: float = 9.0

class TrendPoint(BaseModel):
    date: str
    band: float
    type: str

class LearnerDashboardStats(BaseModel):
    total_submissions: int
    speaking_count: int
    writing_count: int
    average_band: float
    highest_band: float
    cefr_level: str
    current_streak_days: int
    total_practiced_minutes: int
    skill_radar: List[SkillRadarItem]
    trend_history: List[TrendPoint]
    recommended_questions: List[QuestionResponse]

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

Token.model_rebuild()

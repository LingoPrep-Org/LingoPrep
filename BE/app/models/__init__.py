import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text, Float, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str, enum.Enum):
    LEARNER = "LEARNER"
    TEACHER = "TEACHER"
    ADMIN = "ADMIN"

class ExamType(str, enum.Enum):
    IELTS = "IELTS"
    APTIS = "APTIS"

class SkillType(str, enum.Enum):
    SPEAKING = "SPEAKING"
    WRITING = "WRITING"

class SubmissionStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    EVALUATED = "EVALUATED"
    REVIEW_REQUESTED = "REVIEW_REQUESTED"
    REVIEWED = "REVIEWED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.LEARNER, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    target_exam = Column(String(50), default="IELTS")
    target_score = Column(String(50), default="7.0")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    submissions = relationship("Submission", back_populates="user", cascade="all, delete-orphan")
    reviews_given = relationship("TeacherReview", back_populates="teacher", foreign_keys="TeacherReview.teacher_id")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    exam_type = Column(Enum(ExamType), nullable=False, index=True)
    skill = Column(Enum(SkillType), nullable=False, index=True)
    part = Column(String(50), nullable=False) # e.g. "Part 1", "Part 2", "Task 1", "Task 2"
    title = Column(String(255), nullable=False)
    topic = Column(String(100), default="General")
    difficulty = Column(String(50), default="Medium") # Easy, Medium, Hard
    prompt = Column(Text, nullable=False)
    instructions = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True) # for Aptis picture description or IELTS task 1
    prep_time_seconds = Column(Integer, default=60)
    time_limit_seconds = Column(Integer, default=120)
    min_words = Column(Integer, nullable=True)
    max_words = Column(Integer, nullable=True)
    sample_answer = Column(Text, nullable=True)
    rubric_criteria = Column(JSON, nullable=True)
    tags = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    submissions = relationship("Submission", back_populates="question")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    submission_type = Column(Enum(SkillType), nullable=False)
    content_text = Column(Text, nullable=True) # writing essay or speaking transcript
    audio_path = Column(String(500), nullable=True)
    duration_seconds = Column(Integer, default=0)
    word_count = Column(Integer, default=0)
    status = Column(Enum(SubmissionStatus), default=SubmissionStatus.PENDING, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="submissions")
    question = relationship("Question", back_populates="submissions")
    assessment = relationship("Assessment", back_populates="submission", uselist=False, cascade="all, delete-orphan")
    teacher_review = relationship("TeacherReview", back_populates="submission", uselist=False, cascade="all, delete-orphan")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), unique=True, nullable=False)
    overall_band = Column(Float, nullable=False) # e.g. 6.5
    overall_cefr = Column(String(10), nullable=False) # e.g. B2, C1
    fluency_score = Column(Float, nullable=True)
    lexical_score = Column(Float, nullable=True)
    grammar_score = Column(Float, nullable=True)
    pronunciation_score = Column(Float, nullable=True)
    task_response_score = Column(Float, nullable=True)
    coherence_score = Column(Float, nullable=True)
    
    # Detailed breakdown JSON
    criteria_breakdown = Column(JSON, nullable=True) # { "fluency": { "score": 6.5, "comments": "..." } }
    strengths = Column(JSON, default=list) # ["Good range of vocabulary", "..."]
    weaknesses = Column(JSON, default=list) # ["Frequent comma splices", "..."]
    inline_feedback = Column(JSON, default=list) # [{ "original": "...", "improved": "...", "explanation": "..." }]
    model_answer = Column(Text, nullable=True)
    recommendations = Column(JSON, default=list)
    raw_ai_response = Column(Text, nullable=True)
    evaluated_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("Submission", back_populates="assessment")

class TeacherReview(Base):
    __tablename__ = "teacher_reviews"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), unique=True, nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    overall_band = Column(Float, nullable=False)
    overall_cefr = Column(String(10), nullable=False)
    criteria_scores = Column(JSON, nullable=True)
    teacher_notes = Column(Text, nullable=False)
    is_overridden = Column(Boolean, default=False)
    reviewed_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("Submission", back_populates="teacher_review")
    teacher = relationship("User", back_populates="reviews_given", foreign_keys=[teacher_id])

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), default="Practice Session")
    persona = Column(String(50), default="IELTS_EXAMINER") # IELTS_EXAMINER, APTIS_INTERVIEWER, CONVERSATION_PARTNER
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String(20), nullable=False) # "user", "assistant", "system"
    content = Column(Text, nullable=False)
    audio_path = Column(String(500), nullable=True)
    corrections = Column(JSON, nullable=True) # quick grammar or vocabulary tip for this utterance
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="SYSTEM") # EVALUATION_COMPLETED, TEACHER_REVIEWED, SYSTEM
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

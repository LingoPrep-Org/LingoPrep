from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import ChatSession, ChatMessage, User
from app.schemas import (
    ChatSessionCreate, ChatSessionResponse, ChatMessageCreate, ChatMessageResponse
)
from app.core.dependencies import get_current_user
from app.ai.tutor_chatbot import TutorChatbot

router = APIRouter(prefix="/api/chat", tags=["AI Tutor Chatbot"])

@router.post("/sessions", response_model=ChatSessionResponse)
def create_chat_session(
    body: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = ChatSession(
        user_id=current_user.id,
        title=body.title or "Speaking Practice Session",
        persona=body.persona or "IELTS_EXAMINER"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Add initial greeting message from AI
    greeting_map = {
        "IELTS_EXAMINER": "Good day. Welcome to the IELTS Speaking assessment. Could you tell me your full name, please?",
        "APTIS_INTERVIEWER": "Hello! Welcome to the Aptis Speaking test. To begin, could you introduce yourself and tell me what you enjoy doing in your free time?",
        "CONVERSATION_PARTNER": "Hi! I'm Alex, your English speaking partner. What interesting topic are we discussing today?"
    }
    init_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=greeting_map.get(session.persona, greeting_map["IELTS_EXAMINER"])
    )
    db.add(init_msg)
    db.commit()
    db.refresh(session)

    return session

@router.get("/sessions", response_model=List[ChatSessionResponse])
def list_chat_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.created_at.desc()).all()

@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
def get_chat_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session

@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def send_chat_message(
    session_id: int,
    body: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    # 1. Save user message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=body.content.strip(),
        audio_path=body.audio_path
    )
    db.add(user_msg)
    db.commit()

    # 2. Prepare history for AI
    past_messages = [
        {"role": m.role, "content": m.content}
        for m in session.messages[-8:]
    ]

    # 3. Call TutorChatbot
    ai_turn = await TutorChatbot.chat_turn(
        persona=session.persona,
        message_history=past_messages,
        latest_message=body.content.strip()
    )

    # 4. Save AI response
    assistant_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=ai_turn["reply"],
        corrections=ai_turn.get("corrections")
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return assistant_msg

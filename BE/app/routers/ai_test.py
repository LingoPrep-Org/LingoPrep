import os
import uuid
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from app.config import settings
from app.ai.ollama_service import OllamaService
from app.ai.phoneme_evaluator import PhonemeEvaluator
from app.ai.asr_service import ASRService
from app.ai.speaking_evaluator import SpeakingEvaluator
from app.ai.writing_evaluator import WritingEvaluator
from app.ai.tutor_chatbot import TutorChatbot
from app.ai.tts_service import TTSService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["AI Module Testing & Services"])

# In-memory staging cache for recorded speaking attempts
AUDIO_CACHE: Dict[str, Dict[str, Any]] = {}

class ChatRequest(BaseModel):
    persona: str = "IELTS_EXAMINER"
    message: str
    message_history: List[Dict[str, str]] = []

class WritingRequest(BaseModel):
    exam_type: str = "IELTS"
    part: str = "Task 2"
    prompt: str = "Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?"
    essay_text: str
    min_words: int = 150

class ImproveTextRequest(BaseModel):
    text: str

class TTSRequest(BaseModel):
    text: str
    voice_profile: str = "ielts_examiner_british_female"

# -------------------------------------------------------------
# 1. Speaking: Audio Caching & Playback Endpoint
# -------------------------------------------------------------
@router.post("/api/ai/speaking/cache")
async def cache_speaking_audio(
    audio_file: UploadFile = File(...)
):
    """
    Caches candidate's recorded audio answer so the candidate can listen back,
    review the recording, and choose whether to submit for grading.
    """
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    cache_id = f"cache_{uuid.uuid4().hex}"
    ext = os.path.splitext(audio_file.filename)[1] or ".webm"
    file_name = f"{cache_id}{ext}"
    saved_path = os.path.join(settings.UPLOAD_DIR, file_name)

    content = await audio_file.read()
    with open(saved_path, "wb") as f:
        f.write(content)

    audio_url = f"/uploads/{file_name}"
    AUDIO_CACHE[cache_id] = {
        "file_path": saved_path,
        "audio_url": audio_url,
        "size_bytes": len(content),
        "filename": audio_file.filename
    }

    return {
        "cache_id": cache_id,
        "audio_url": audio_url,
        "size_bytes": len(content),
        "message": "Audio cached successfully. Candidate may listen back before submitting for assessment."
    }

# -------------------------------------------------------------
# 2. Speaking: Full Dual-Stream Assessment Endpoint
# -------------------------------------------------------------
@router.post("/api/ai/speaking/evaluate")
async def evaluate_speaking(
    cache_id: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
    exam_type: str = Form("IELTS"),
    part: str = Form("Part 2"),
    prompt: str = Form("Describe a memorable journey you have made."),
    client_transcript: Optional[str] = Form(None)
):
    """
    Executes the dual-stream speaking evaluation:
    1. Stream A: Acoustic phoneme error recognition via slplab/wav2vec2-large-robust-L2-english-phoneme-recognition
    2. Stream B: Speech-to-Text via Qwen3-ASR-0.6B
    3. Logic & Linguistic Grading: Ollama qwen3:4b-instruct
    """
    saved_path = None

    if cache_id:
        if cache_id in AUDIO_CACHE:
            saved_path = AUDIO_CACHE[cache_id]["file_path"]
        else:
            # Check on disk in UPLOAD_DIR if server restarted
            for ext in [".webm", ".wav", ".mp3", ".m4a", ".ogg", ""]:
                candidate_path = os.path.join(settings.UPLOAD_DIR, f"{cache_id}{ext}")
                if os.path.exists(candidate_path):
                    saved_path = candidate_path
                    break

    if not saved_path and audio_file:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        ext = os.path.splitext(audio_file.filename)[1] or ".webm"
        file_name = f"speaking_{uuid.uuid4().hex}{ext}"
        saved_path = os.path.join(settings.UPLOAD_DIR, file_name)
        content = await audio_file.read()
        with open(saved_path, "wb") as f:
            f.write(content)

    if not saved_path or not os.path.exists(saved_path):
        # Allow fallback evaluation when client provides transcript without audio
        if client_transcript:
            return await SpeakingEvaluator.evaluate(
                exam_type=exam_type,
                part=part,
                prompt=prompt,
                transcript=client_transcript
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either cached audio (cache_id) or audio_file must be provided."
        )

    return await SpeakingEvaluator.evaluate_from_audio(
        exam_type=exam_type,
        part=part,
        prompt=prompt,
        audio_path=saved_path,
        client_transcript=client_transcript
    )

# -------------------------------------------------------------
# 3. Model Inspection: Acoustic Phoneme & ASR Endpoints
# -------------------------------------------------------------
@router.post("/api/ai/test/phoneme-recognition")
async def test_phoneme_recognition(
    audio_file: UploadFile = File(...),
    transcript: Optional[str] = Form(None)
):
    """Directly tests model slplab/wav2vec2-large-robust-L2-english-phoneme-recognition."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(audio_file.filename)[1] or ".webm"
    temp_path = os.path.join(settings.UPLOAD_DIR, f"test_phoneme_{uuid.uuid4().hex[:8]}{ext}")
    content = await audio_file.read()
    with open(temp_path, "wb") as f:
        f.write(content)

    try:
        return PhonemeEvaluator.analyze_audio_acoustics(temp_path, transcript=transcript)
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

@router.post("/api/ai/test/asr-transcription")
async def test_asr_transcription(
    audio_file: UploadFile = File(...)
):
    """Directly tests model Qwen/Qwen3-ASR-0.6B."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(audio_file.filename)[1] or ".webm"
    temp_path = os.path.join(settings.UPLOAD_DIR, f"test_asr_{uuid.uuid4().hex[:8]}{ext}")
    content = await audio_file.read()
    with open(temp_path, "wb") as f:
        f.write(content)

    try:
        return await ASRService.transcribe(temp_path)
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

# -------------------------------------------------------------
# 4. Writing & Text Improvement Endpoints (Ollama qwen3:4b-instruct)
# -------------------------------------------------------------
@router.post("/api/ai/writing/evaluate")
async def evaluate_writing_endpoint(body: WritingRequest):
    """Evaluates essay using Ollama qwen3:4b-instruct with official criteria."""
    return await WritingEvaluator.evaluate(
        exam_type=body.exam_type,
        part=body.part,
        prompt=body.prompt,
        essay_text=body.essay_text,
        min_words=body.min_words
    )

@router.post("/api/ai/writing/improve")
async def improve_text_endpoint(body: ImproveTextRequest):
    """Rewrites text to C1/C2 academic standard using Ollama qwen3:4b-instruct."""
    return await WritingEvaluator.improve_text(body.text)

# -------------------------------------------------------------
# 5. Tutor Chatbot / Q&A Endpoint (Ollama qwen3:4b-instruct)
# -------------------------------------------------------------
@router.post("/api/ai/chat")
async def chat_endpoint(body: ChatRequest):
    """Conversational dialogue turn with persona system prompts via Ollama qwen3:4b-instruct."""
    return await TutorChatbot.chat_turn(
        persona=body.persona,
        message_history=body.message_history,
        latest_message=body.message
    )

# -------------------------------------------------------------
# 6. Text-to-Speech (Mozilla Web Speech API & Edge-TTS)
# -------------------------------------------------------------
@router.get("/api/ai/tts/config")
def get_tts_config(voice_profile: str = "ielts_examiner_british_female"):
    """Returns Mozilla Web Speech API client parameters."""
    return TTSService.get_web_speech_config(voice_profile)

@router.post("/api/ai/tts/synthesize")
async def synthesize_tts(body: TTSRequest):
    """Server-side synthesis using edge-tts as audio alternative."""
    return await TTSService.synthesize_server_audio(
        text=body.text,
        voice_profile=body.voice_profile
    )

# -------------------------------------------------------------
# 7. Interactive Test Frontend HTML
# -------------------------------------------------------------
@router.get("/ai-test")
def serve_ai_test_page():
    """Serves the interactive HTML test frontend built for testing all AI models."""
    html_path = os.path.join(os.path.dirname(__file__), "..", "static", "ai_test.html")
    if os.path.exists(html_path):
        return FileResponse(html_path, media_type="text/html")
    raise HTTPException(status_code=404, detail="Test UI HTML file not found.")

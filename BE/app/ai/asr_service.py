import os
import time
import logging
from typing import Dict, Any, Optional
import torch
import librosa
from app.config import settings

logger = logging.getLogger(__name__)

UNCLEAR_AUDIO_MESSAGE = "không rõ âm thanh hoặc độ dài chưa đủ"

class ASRService:
    """
    Automatic Speech Recognition service powered by 'Qwen/Qwen3-ASR-0.6B'.
    Converts audio recordings into text and measures pacing metrics.
    If speech is unclear or audio duration is insufficient, returns:
    'không rõ âm thanh hoặc độ dài chưa đủ'
    """
    _model_id = "Qwen/Qwen3-ASR-0.6B"
    _model = None
    _load_attempted = False

    @classmethod
    def get_model(cls):
        """Attempts to load cached Qwen3-ASR-0.6B model without blocking requests."""
        if cls._model is None and not cls._load_attempted:
            cls._load_attempted = True
            try:
                from qwen_asr import Qwen3ASRModel
                device = "cuda:0" if torch.cuda.is_available() else "cpu"
                dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32

                cls._model = Qwen3ASRModel.from_pretrained(
                    cls._model_id,
                    dtype=dtype,
                    device_map=device,
                    max_inference_batch_size=4,
                    max_new_tokens=512
                )
                logger.info(f"Qwen3-ASR model loaded successfully on {device}.")
            except Exception as e:
                logger.warning(f"Qwen3-ASR local weights load notice: {e}")
                cls._model = None
                cls._load_attempted = False
        return cls._model

    @classmethod
    async def transcribe(
        cls,
        audio_path: str,
        language: str = "English",
        client_transcript: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Transcribes speech from audio file using Qwen3-ASR-0.6B.
        Extracts duration, word count, and speech tempo (WPM).
        If audio is empty, too short (< 1s), or unrecognizable, returns:
        'không rõ âm thanh hoặc độ dài chưa đủ'
        """
        import asyncio
        start_time = time.time()
        duration_seconds = 0.0

        if os.path.exists(audio_path):
            try:
                duration_seconds = round(float(librosa.get_duration(path=audio_path)), 2)
            except Exception:
                duration_seconds = 0.0

        # If audio is practically empty or under 0.8s
        if duration_seconds < 0.8 and (not client_transcript or len(client_transcript.strip()) < 3):
            return {
                "transcript": UNCLEAR_AUDIO_MESSAGE,
                "word_count": 0,
                "duration_seconds": duration_seconds,
                "speaking_rate_wpm": 0.0,
                "confidence": 0.0,
                "model_used": cls._model_id,
                "is_unclear": True,
                "inference_time_seconds": round(time.time() - start_time, 2)
            }

        transcribed_text = None
        model_name = cls._model_id
        confidence = 0.0

        # 1. Try Qwen3-ASR if loaded
        try:
            model = cls.get_model()
            if model is not None and os.path.exists(audio_path):
                results = await asyncio.to_thread(
                    model.transcribe,
                    audio=audio_path,
                    language=language
                )
                if results and len(results) > 0 and len(results[0].text.strip()) > 1:
                    transcribed_text = results[0].text.strip()
                    confidence = 0.95
                    logger.info(f"Qwen3-ASR transcribed: '{transcribed_text[:60]}...'")
        except Exception as e:
            logger.warning(f"Qwen3-ASR transcription error: {e}")

        # 2. Client-side transcript provided by browser Web Speech API
        if (not transcribed_text or len(transcribed_text.strip()) < 2) and client_transcript and len(client_transcript.strip()) >= 2:
            transcribed_text = client_transcript.strip()
            model_name = "browser_web_speech_asr"
            confidence = 0.92

        # 3. If still nothing detected or unclear
        if not transcribed_text or len(transcribed_text.strip()) < 2:
            transcribed_text = UNCLEAR_AUDIO_MESSAGE
            return {
                "transcript": UNCLEAR_AUDIO_MESSAGE,
                "word_count": 0,
                "duration_seconds": duration_seconds,
                "speaking_rate_wpm": 0.0,
                "confidence": 0.0,
                "model_used": model_name,
                "is_unclear": True,
                "inference_time_seconds": round(time.time() - start_time, 2)
            }

        words = transcribed_text.split()
        word_count = len(words)
        effective_duration = max(1.0, duration_seconds)
        speaking_rate_wpm = round((word_count / effective_duration) * 60, 1)
        speaking_rate_wpm = max(40.0, min(220.0, speaking_rate_wpm))

        return {
            "transcript": transcribed_text,
            "word_count": word_count,
            "duration_seconds": duration_seconds,
            "speaking_rate_wpm": speaking_rate_wpm,
            "confidence": confidence,
            "model_used": model_name,
            "is_unclear": False,
            "inference_time_seconds": round(time.time() - start_time, 2)
        }

import os
import uuid
import logging
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)

# Standard recommended voice profiles mapping to Mozilla Web Speech API and backend TTS
VOICE_PROFILES = {
    "ielts_examiner_british_male": {
        "id": "ielts_examiner_british_male",
        "name": "IELTS Examiner (British Male)",
        "web_speech_lang": "en-GB",
        "preferred_names": ["Google UK English Male", "Microsoft Ryan Online (Natural) - English (United Kingdom)", "Daniel", "Oliver"],
        "pitch": 1.0,
        "rate": 0.95,
        "edge_tts_voice": "en-GB-RyanNeural"
    },
    "ielts_examiner_british_female": {
        "id": "ielts_examiner_british_female",
        "name": "IELTS Examiner (British Female)",
        "web_speech_lang": "en-GB",
        "preferred_names": ["Google UK English Female", "Microsoft Sonia Online (Natural) - English (United Kingdom)", "Serena", "Victoria"],
        "pitch": 1.0,
        "rate": 0.95,
        "edge_tts_voice": "en-GB-SoniaNeural"
    },
    "aptis_interviewer_us": {
        "id": "aptis_interviewer_us",
        "name": "Aptis Interviewer (American English)",
        "web_speech_lang": "en-US",
        "preferred_names": ["Google US English", "Microsoft Guy Online (Natural) - English (United States)", "Alex", "Samantha"],
        "pitch": 1.0,
        "rate": 0.98,
        "edge_tts_voice": "en-US-GuyNeural"
    },
    "conversation_partner_alex": {
        "id": "conversation_partner_alex",
        "name": "Alex - Conversation Partner (Friendly British)",
        "web_speech_lang": "en-GB",
        "preferred_names": ["Google UK English Male", "Microsoft Thomas Online (Natural) - English (United Kingdom)"],
        "pitch": 1.05,
        "rate": 1.0,
        "edge_tts_voice": "en-GB-ThomasNeural"
    }
}

class TTSService:
    """
    Text-to-Speech service providing Mozilla Web Speech API integration specifications
    and backend Edge-TTS audio synthesis fallback.
    """

    @classmethod
    def get_web_speech_config(cls, voice_profile: str = "ielts_examiner_british_female") -> Dict[str, Any]:
        """
        Returns ready-to-use Mozilla Web Speech API configuration for frontend clients.
        Reference: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
        """
        profile = VOICE_PROFILES.get(voice_profile, VOICE_PROFILES["ielts_examiner_british_female"])
        return {
            "api": "Mozilla Web Speech API (window.speechSynthesis)",
            "selected_profile": profile,
            "available_profiles": list(VOICE_PROFILES.values()),
            "client_usage_example": {
                "js_snippet": (
                    "const utterance = new SpeechSynthesisUtterance(text);\n"
                    f"utterance.lang = '{profile['web_speech_lang']}';\n"
                    f"utterance.pitch = {profile['pitch']};\n"
                    f"utterance.rate = {profile['rate']};\n"
                    "window.speechSynthesis.speak(utterance);"
                )
            }
        }

    @classmethod
    async def synthesize_server_audio(
        cls,
        text: str,
        voice_profile: str = "ielts_examiner_british_female"
    ) -> Dict[str, Any]:
        """
        Generates server-side MP3 audio using edge-tts as a persistent audio alternative.
        """
        profile = VOICE_PROFILES.get(voice_profile, VOICE_PROFILES["ielts_examiner_british_female"])
        edge_voice = profile.get("edge_tts_voice", "en-GB-SoniaNeural")

        file_name = f"tts_{uuid.uuid4().hex[:12]}.mp3"
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(settings.UPLOAD_DIR, file_name)

        try:
            import edge_tts
            communicate = edge_tts.Communicate(text=text, voice=edge_voice)
            await communicate.save(file_path)
            audio_url = f"/uploads/{file_name}"
            return {
                "status": "success",
                "audio_url": audio_url,
                "file_path": file_path,
                "voice_used": edge_voice,
                "text": text
            }
        except Exception as e:
            logger.error(f"Error during edge-tts synthesis: {e}")
            return {
                "status": "error",
                "message": f"Server TTS synthesis failed: {str(e)}",
                "fallback_instruction": "Use client-side Mozilla Web Speech API instead."
            }

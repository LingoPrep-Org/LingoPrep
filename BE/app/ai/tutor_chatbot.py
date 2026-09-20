import logging
from typing import Dict, Any, List, Optional
from app.ai.ollama_service import OllamaService

logger = logging.getLogger(__name__)

class TutorChatbot:
    """
    Interactive AI Tutor & Q&A assistant powered by Ollama qwen3:4b-instruct.
    Supports authentic personas (IELTS Examiner, Aptis Interviewer, Conversation Partner, Grammar Coach)
    with customized system prompts and targeted micro-feedback.
    """

    @classmethod
    async def chat_turn(
        cls,
        persona: str,
        message_history: List[Dict[str, str]],
        latest_message: str
    ) -> Dict[str, Any]:
        """
        Processes a multi-turn conversation with the AI tutor via Ollama qwen3:4b-instruct.
        """
        full_history = list(message_history)
        full_history.append({"role": "user", "content": latest_message})

        # 1. Query Ollama with persona-specific system prompt
        ollama_response = await OllamaService.chat_stream_or_turn(
            messages=full_history[-8:],
            persona=persona,
            temperature=0.7
        )

        reply_text = ollama_response.get("reply", "")
        micro_tip = ollama_response.get("corrections")

        # If model didn't provide a micro-tip, generate a relevant linguistic suggestion
        if not micro_tip:
            micro_tip = cls._extract_micro_tip(latest_message)

        return {
            "reply": reply_text,
            "corrections": micro_tip,
            "persona": persona,
            "model_used": ollama_response.get("model", "qwen3:4b-instruct")
        }

    @classmethod
    def _extract_micro_tip(cls, text: str) -> Dict[str, str]:
        lower = text.lower()
        if "i think" in lower:
            return {
                "tip": "Upgrade 'I think' to 'From my perspective', 'In my conviction', or 'I am inclined to believe'.",
                "type": "Vocabulary Upgrade"
            }
        if "very" in lower:
            return {
                "tip": "Avoid weak intensifiers like 'very + adjective'. Try 'exceptionally', 'immensely', or 'profoundly'.",
                "type": "Lexical Variety"
            }
        if len(text.split()) < 12:
            return {
                "tip": "Extend your responses using the PEEL structure (Point, Explanation, Example, Link).",
                "type": "Fluency Expansion"
            }
        return {
            "tip": "Clear sentence formulation. Keep utilizing connecting words like 'Moreover' or 'Whereas' to link thoughts.",
            "type": "Fluency & Coherence"
        }

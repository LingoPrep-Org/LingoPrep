import logging
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

class TutorChatbot:
    @classmethod
    async def chat_turn(
        cls,
        persona: str,
        message_history: List[Dict[str, str]],
        latest_message: str
    ) -> Dict[str, Any]:
        """
        Processes a conversation turn between student and AI Tutor.
        Provides both an in-character response and micro-feedback (corrections).
        """
        persona_instructions = {
            "IELTS_EXAMINER": (
                "You are an experienced IELTS Speaking Examiner. Conduct an authentic IELTS Speaking interview. "
                "Ask one clear question at a time. Maintain an encouraging yet professional tone. "
                "After your response, provide 1-2 quick constructive language tips (grammar, pronunciation, or vocabulary upgrade)."
            ),
            "APTIS_INTERVIEWER": (
                "You are a British Council Aptis ESOL Examiner. Ask questions aligned with Aptis Speaking tasks "
                "(daily life, describing situations, expressing preferences). Give short, clear prompts."
            ),
            "CONVERSATION_PARTNER": (
                "You are a friendly native English conversation partner named Alex. "
                "Engage in vibrant, natural dialogue on interesting topics, sharing personal anecdotes "
                "and asking engaging open-ended questions."
            )
        }

        instruction = persona_instructions.get(persona, persona_instructions["IELTS_EXAMINER"])

        # Try Gemini or OpenAI if configured
        if settings.GEMINI_API_KEY:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                contents = []
                for m in message_history[-6:]:
                    role = "model" if m["role"] == "assistant" else "user"
                    contents.append({"role": role, "parts": [{"text": m["content"]}]})
                contents.append({"role": "user", "parts": [{"text": latest_message}]})

                async with httpx.AsyncClient(timeout=25.0) as client:
                    resp = await client.post(
                        url,
                        json={
                            "system_instruction": {"parts": [{"text": instruction}]},
                            "contents": contents,
                            "generationConfig": {"temperature": 0.7, "maxOutputTokens": 300}
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        reply = data["candidates"][0]["content"]["parts"][0]["text"]
                        return {
                            "reply": reply,
                            "corrections": cls._extract_micro_tip(latest_message)
                        }
            except Exception as e:
                logger.warning(f"Chatbot Gemini call failed: {e}")

        # Intelligent Fallback Responses based on persona & user message
        lower = latest_message.lower()
        if "hello" in lower or "hi" in lower or len(message_history) == 0:
            if persona == "IELTS_EXAMINER":
                reply = (
                    "Good morning/afternoon! My name is Examiner Davis. "
                    "Could you please tell me your full name, and what do you do or study?"
                )
            elif persona == "APTIS_INTERVIEWER":
                reply = (
                    "Hello and welcome to the Aptis Speaking assessment. "
                    "To start off, could you tell me a little bit about your hometown and what you like most about it?"
                )
            else:
                reply = (
                    "Hey there! Great to practice with you today! "
                    "What exciting topic would you like to talk about—travel, movies, hobbies, or recent tech trends?"
                )
        elif "hometown" in lower or "live" in lower or "study" in lower:
            reply = (
                "That's very interesting. How has your area changed over the past five to ten years? "
                "Do you think those changes have benefited local residents?"
            )
        elif "technology" in lower or "ai" in lower or "phone" in lower:
            reply = (
                "Technology certainly plays a pervasive role today. "
                "In your opinion, do you believe modern digital devices make people more connected, "
                "or does it inadvertently lead to isolation?"
            )
        else:
            reply = (
                "Thank you for sharing that perspective. That's a thoughtful point. "
                "Looking ahead, how do you see this trend evolving in the next decade? "
                "Could you give a specific example to support your view?"
            )

        return {
            "reply": reply,
            "corrections": cls._extract_micro_tip(latest_message)
        }

    @classmethod
    def _extract_micro_tip(cls, text: str) -> Optional[Dict[str, str]]:
        lower = text.lower()
        if "i think" in lower:
            return {
                "tip": "Upgrade 'I think' to 'In my perspective', 'From my viewpoint', or 'I am convinced that'.",
                "type": "Vocabulary Upgrade"
            }
        if "good" in lower:
            return {
                "tip": "Try more descriptive synonyms instead of 'good': 'exceptional', 'advantageous', or 'rewarding'.",
                "type": "Lexical Variety"
            }
        if len(text.split()) < 10:
            return {
                "tip": "Aim to expand your response using the PEEL technique: Point + Explanation + Example.",
                "type": "Fluency Tip"
            }
        return {
            "tip": "Good pacing and sentence structure! Keep using subordinate clauses to connect ideas.",
            "type": "Positive Feedback"
        }

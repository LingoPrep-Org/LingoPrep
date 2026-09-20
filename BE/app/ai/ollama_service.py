import json
import re
import logging
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = getattr(settings, "OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = getattr(settings, "OLLAMA_MODEL", "qwen3:4b-instruct")

# Task-specific system prompts
SPEAKING_SYSTEM_PROMPT = """You are an elite Cambridge IELTS Senior Examiner and British Council Aptis Speaking Specialist.
Your task is to comprehensively evaluate a candidate's speaking response based on:
1. Transcribed text (ASR from audio)
2. Acoustic timing and pacing metrics (WPM, duration)
3. Direct acoustic phoneme error recognition findings from wav2vec2 L2 phoneme analysis

You must evaluate four standard criteria:
- Fluency & Coherence (pacing, continuity, linking markers, natural flow)
- Lexical Resource (idiomatic range, collocations, precision, avoidance of clichés)
- Grammatical Range & Accuracy (complex clause variety, tense consistency, error frequency)
- Pronunciation (clarity, rhythm, and specifically address the detected phoneme acoustic errors)

CRITICAL: You MUST respond ONLY with a strictly valid JSON object adhering to this schema:
{
  "overall_band": 6.5,
  "overall_cefr": "B2",
  "fluency_score": 6.5,
  "lexical_score": 6.5,
  "grammar_score": 6.0,
  "pronunciation_score": 7.0,
  "criteria_breakdown": {
    "fluency": {"score": 6.5, "feedback": "Detailed assessment of pacing and continuity"},
    "lexical": {"score": 6.5, "feedback": "Detailed assessment of vocabulary range and flexibility"},
    "grammar": {"score": 6.0, "feedback": "Detailed assessment of sentence structures and accuracy"},
    "pronunciation": {"score": 7.0, "feedback": "Detailed assessment citing specific phoneme errors and phonetic advice"}
  },
  "acoustic_phoneme_feedback": [
    {
      "phoneme_error": "string",
      "target_sound": "string",
      "guidance": "string"
    }
  ],
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "inline_feedback": [
    {
      "original": "string",
      "improved": "string",
      "explanation": "string",
      "category": "Vocabulary / Grammar / Pronunciation"
    }
  ],
  "model_answer": "Natural, high-band native-level spoken response to the prompt",
  "recommendations": ["Actionable practice step 1", "Actionable practice step 2"]
}
"""

WRITING_SYSTEM_PROMPT = """You are a Principal Cambridge IELTS and British Council Aptis Senior Writing Examiner.
Evaluate the candidate's writing submission strictly against official public band descriptors.

Scoring criteria:
- Task Response / Achievement (thoroughness, clear stance, relevant supporting ideas)
- Coherence & Cohesion (logical paragraph progression, sophisticated discourse markers, clear referencing)
- Lexical Resource (academic vocabulary, precise collocations, style register, spelling)
- Grammatical Range & Accuracy (mix of simple and complex sentence structures, punctuation, syntactic control)

CRITICAL: You MUST respond ONLY with a strictly valid JSON object matching this schema:
{
  "overall_band": 6.5,
  "overall_cefr": "B2",
  "task_response_score": 6.5,
  "coherence_score": 6.5,
  "lexical_score": 6.5,
  "grammar_score": 6.0,
  "criteria_breakdown": {
    "task_response": {"score": 6.5, "feedback": "Detailed evaluation of content and argument development"},
    "coherence": {"score": 6.5, "feedback": "Detailed evaluation of paragraph structure and cohesive devices"},
    "lexical": {"score": 6.5, "feedback": "Detailed evaluation of vocabulary sophistication and precision"},
    "grammar": {"score": 6.0, "feedback": "Detailed evaluation of syntactic variety and grammatical accuracy"}
  },
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string", "string"],
  "inline_feedback": [
    {
      "original": "exact sentence or phrase from essay",
      "improved": "academic, high-band equivalent rewrite",
      "explanation": "concise grammatical or lexical rationale",
      "category": "Academic Style / Grammar / Lexical Resource / Cohesion"
    }
  ],
  "model_answer": "Complete, exemplary Band 8.5 - 9.0 essay addressing the prompt with nuanced arguments",
  "recommendations": ["Actionable improvement technique 1", "Actionable improvement technique 2"]
}
"""

TUTOR_CHAT_SYSTEM_PROMPTS = {
    "IELTS_EXAMINER": (
        "You are an experienced, certified IELTS Speaking Examiner named Examiner Davis. "
        "Conduct an authentic IELTS Speaking test interview. "
        "Ask only one focused, clear question at a time. Maintain a courteous, professional tone. "
        "At the conclusion of each response, include a brief 'Micro-Feedback' tip (vocabulary upgrade or grammar correction) "
        "formatted on a new line: [Tip: your advice here]."
    ),
    "APTIS_INTERVIEWER": (
        "You are a British Council Aptis ESOL Examiner. "
        "Conduct a realistic Aptis Speaking interview covering daily life, personal experiences, and situational comparisons. "
        "Keep your questions concise and accessible, matching the Aptis test format. "
        "At the end of your message, provide a brief 'Micro-Feedback' tip on a new line: [Tip: your advice here]."
    ),
    "CONVERSATION_PARTNER": (
        "You are Alex, an engaging, friendly native English conversation partner from London. "
        "Engage in lively, natural English conversation, sharing brief personal anecdotes, asking open-ended questions, "
        "and encouraging the student to express their thoughts freely. "
        "At the end, add an encouraging micro-tip: [Tip: your advice here]."
    ),
    "GRAMMAR_COACH": (
        "You are an expert English Language and Grammar Coach. "
        "Analyze the learner's message carefully. Reply warmly to their message, and provide an explicit breakdown of any "
        "grammatical, lexical, or prepostional issues with clear examples and practice suggestions."
    )
}

TEXT_IMPROVEMENT_SYSTEM_PROMPT = """You are a Master English Stylist and Academic Writing Editor.
Given a student's text, your goal is to elevate it to CEFR C1/C2 academic standard.
Return ONLY valid JSON with the following structure:
{
  "original_text": "string",
  "improved_text": "string (sophisticated, natural, fluent rewrite)",
  "cefr_estimated": "string (e.g. B1 -> C1)",
  "vocabulary_upgrades": [
    {"basic": "string", "advanced": "string", "context": "string"}
  ],
  "grammar_enhancements": [
    {"original": "string", "corrected": "string", "reason": "string"}
  ],
  "summary_of_changes": "string"
}
"""

class OllamaService:
    """
    Dedicated client for local Ollama service running qwen3:4b-instruct.
    Provides structured JSON generation and dynamic system prompt routing.
    """

    @classmethod
    async def is_available(cls) -> bool:
        """Check if local Ollama server is running and responding."""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
                return resp.status_code == 200
        except Exception:
            return False

    @classmethod
    async def generate_json(
        cls,
        prompt: str,
        system_prompt: str,
        model: str = OLLAMA_MODEL,
        temperature: float = 0.2
    ) -> Optional[Dict[str, Any]]:
        """
        Queries Ollama with system and user prompt, enforcing and extracting valid JSON.
        """
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "stream": False,
            "format": "json",
            "options": {
                "temperature": temperature,
                "num_ctx": 4096
            }
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{OLLAMA_BASE_URL}/api/chat",
                    json=payload
                )
                if response.status_code == 200:
                    data = response.json()
                    content = data.get("message", {}).get("content", "").strip()
                    parsed = cls._extract_json(content)
                    if parsed:
                        return parsed
                else:
                    logger.warning(f"Ollama chat returned status {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Error calling Ollama qwen3:4b-instruct: {e}")

        # Try fallback to /api/generate if /api/chat didn't succeed
        try:
            gen_payload = {
                "model": model,
                "prompt": f"{system_prompt}\n\nCandidate / User Input:\n{prompt}\n\nRespond in strictly valid JSON:",
                "stream": False,
                "format": "json",
                "options": {
                    "temperature": temperature,
                    "num_ctx": 4096
                }
            }
            async with httpx.AsyncClient(timeout=120.0) as client:
                resp = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=gen_payload)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data.get("response", "").strip()
                    return cls._extract_json(content)
        except Exception as e:
            logger.error(f"Error calling Ollama generate fallback: {e}")

        return None

    @classmethod
    async def chat_stream_or_turn(
        cls,
        messages: List[Dict[str, str]],
        persona: str = "IELTS_EXAMINER",
        model: str = OLLAMA_MODEL,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Executes a dialogue turn with Ollama using persona-tailored system prompt.
        """
        system_instruction = TUTOR_CHAT_SYSTEM_PROMPTS.get(
            persona, TUTOR_CHAT_SYSTEM_PROMPTS["IELTS_EXAMINER"]
        )

        formatted_messages = [{"role": "system", "content": system_instruction}]
        for m in messages:
            formatted_messages.append({
                "role": m.get("role", "user"),
                "content": m.get("content", "")
            })

        payload = {
            "model": model,
            "messages": formatted_messages,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_ctx": 4096
            }
        }

        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                resp = await client.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    full_reply = data.get("message", {}).get("content", "").strip()
                    reply_text, tip = cls._parse_micro_tip(full_reply)
                    return {
                        "reply": reply_text,
                        "corrections": tip,
                        "persona": persona,
                        "model": model
                    }
        except Exception as e:
            logger.error(f"Error in Ollama chat turn: {e}")

        return {
            "reply": "Thank you for your response. Let's continue: could you expand on why you feel this way?",
            "corrections": {"tip": "Aim to use linking phrases like 'Furthermore' or 'In addition' to extend your thoughts.", "type": "Fluency Tip"},
            "persona": persona,
            "model": "fallback"
        }

    @classmethod
    def _extract_json(cls, raw: str) -> Optional[Dict[str, Any]]:
        """Cleans and extracts JSON from markdown-wrapped or raw text."""
        if not raw:
            return None
        clean = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.MULTILINE)
        clean = re.sub(r"\s*```$", "", clean, flags=re.MULTILINE).strip()

        try:
            return json.loads(clean)
        except Exception:
            pass

        match = re.search(r"(\{.*\})", raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except Exception:
                pass

        return None

    @classmethod
    def _parse_micro_tip(cls, raw_reply: str) -> tuple[str, Optional[Dict[str, str]]]:
        """Separates the conversational reply from micro-feedback tip if present."""
        tip_match = re.search(r"\[Tip:\s*(.*?)\]", raw_reply, re.DOTALL | re.IGNORECASE)
        if tip_match:
            tip_content = tip_match.group(1).strip()
            clean_reply = re.sub(r"\[Tip:\s*.*?\]", "", raw_reply, flags=re.DOTALL | re.IGNORECASE).strip()
            return clean_reply, {"tip": tip_content, "type": "AI Tutor Tip"}
        
        split_match = re.split(r"\n(?:Tip|Feedback|Correction|Language Note):\s*", raw_reply, maxsplit=1, flags=re.IGNORECASE)
        if len(split_match) == 2:
            return split_match[0].strip(), {"tip": split_match[1].strip(), "type": "Language Upgrade"}

        return raw_reply, None

import json
import logging
from typing import Dict, Any, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

class AIGateway:
    """
    Unified AI Gateway abstraction layer.
    Routes queries to Gemini, OpenAI, or local intelligent fallback.
    """
    @classmethod
    async def generate_json(cls, prompt: str, system_instruction: str = "") -> Optional[Dict[str, Any]]:
        # 1. Try Gemini if configured
        if settings.GEMINI_API_KEY:
            try:
                result = await cls._call_gemini(prompt, system_instruction)
                if result:
                    return result
            except Exception as e:
                logger.warning(f"Gemini API call failed: {e}. Attempting fallback.")

        # 2. Try OpenAI if configured
        if settings.OPENAI_API_KEY:
            try:
                result = await cls._call_openai(prompt, system_instruction)
                if result:
                    return result
            except Exception as e:
                logger.warning(f"OpenAI API call failed: {e}. Attempting fallback.")

        return None

    @classmethod
    async def _call_gemini(cls, prompt: str, system_instruction: str) -> Optional[Dict[str, Any]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"role": "user", "parts": [{"text": f"{system_instruction}\n\n{prompt}"}]}],
            "generationConfig": {"responseMimeType": "application/json", "temperature": 0.3}
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text)
        return None

    @classmethod
    async def _call_openai(cls, prompt: str, system_instruction: str) -> Optional[Dict[str, Any]]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}", "Content-Type": "application/json"}
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": f"{system_instruction}. You must respond in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.3
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                return json.loads(content)
        return None

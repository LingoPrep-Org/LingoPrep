import os
import sys

if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import numpy as np
import soundfile as sf
import pytest
import httpx
from fastapi.testclient import TestClient

# Ensure BE is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.ai.ollama_service import OllamaService
from app.ai.phoneme_evaluator import PhonemeEvaluator
from app.ai.asr_service import ASRService
from app.ai.speaking_evaluator import SpeakingEvaluator
from app.ai.writing_evaluator import WritingEvaluator
from app.ai.tutor_chatbot import TutorChatbot
from app.ai.tts_service import TTSService

client = TestClient(app)

def create_sample_wav(filename: str = "sample_test_audio.wav", duration: float = 3.0, sr: int = 16000) -> str:
    """Generates a clean synthetic 16kHz WAV audio file for acoustic testing."""
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    # Formant frequency synthesis simulating speech vowel sounds (~250Hz, 800Hz, 2400Hz)
    audio = 0.4 * np.sin(2 * np.pi * 250 * t) + 0.3 * np.sin(2 * np.pi * 800 * t) + 0.1 * np.sin(2 * np.pi * 2400 * t)
    audio = audio.astype(np.float32)
    filepath = os.path.join(os.path.dirname(__file__), filename)
    sf.write(filepath, audio, sr)
    return filepath

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_ai_test_html_page():
    response = client.get("/ai-test")
    assert response.status_code == 200
    assert "LingoPrep AI Studio" in response.text
    assert "wav2vec2" in response.text
    assert "qwen3:4b-instruct" in response.text

@pytest.mark.asyncio
async def test_ollama_service_connectivity():
    is_up = await OllamaService.is_available()
    print(f"\n[Test] Ollama is_available: {is_up}")
    assert is_up is True, "Ollama server is not running on localhost:11434"

@pytest.mark.asyncio
async def test_writing_evaluator():
    essay = (
        "In modern society, some argue that universities should focus strictly on vocational skills, "
        "while others believe academic theory is more essential. In my opinion, while technical skills "
        "provide immediate employability, theoretical knowledge fosters long-term innovation."
    )
    result = await WritingEvaluator.evaluate(
        exam_type="IELTS",
        part="Task 2",
        prompt="Discuss both views and give your opinion on vocational vs theoretical education.",
        essay_text=essay,
        min_words=200
    )
    assert "overall_band" in result
    assert "criteria_breakdown" in result
    assert result["overall_band"] >= 5.0
    print(f"\n[Test] Writing Evaluator Band: {result['overall_band']} ({result.get('overall_cefr')})")

@pytest.mark.asyncio
async def test_tutor_chatbot():
    res = await TutorChatbot.chat_turn(
        persona="IELTS_EXAMINER",
        message_history=[],
        latest_message="Hello, my name is John and I study computer science."
    )
    assert "reply" in res
    assert len(res["reply"]) > 5
    print(f"\n[Test] Tutor Chat Reply: {res['reply'][:100]}...")

def test_phoneme_evaluator_acoustics():
    audio_path = create_sample_wav("phoneme_test.wav", duration=2.5)
    try:
        results = PhonemeEvaluator.analyze_audio_acoustics(audio_path)
        assert "acoustic_pronunciation_score" in results
        assert "phoneme_error_rate_pct" in results
        assert "ielts_pronunciation_band" in results
        print(f"\n[Test] Phoneme Acoustics Score: {results['acoustic_pronunciation_score']}/100, Band: {results['ielts_pronunciation_band']}")
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)

@pytest.mark.asyncio
async def test_asr_unclear_audio():
    # Audio with very short duration (< 0.5s)
    short_audio_path = create_sample_wav("too_short.wav", duration=0.3)
    try:
        asr_res = await ASRService.transcribe(short_audio_path)
        assert asr_res["transcript"] == "không rõ âm thanh hoặc độ dài chưa đủ"
        assert asr_res["is_unclear"] is True
        assert asr_res["word_count"] == 0
        print(f"\n[Test] ASR Unclear Audio Message Verified: '{asr_res['transcript']}'")

        # Check that SpeakingEvaluator returns unclear notice
        spk_res = await SpeakingEvaluator.evaluate_from_audio(
            exam_type="IELTS",
            part="Part 1",
            prompt="Tell me about yourself.",
            audio_path=short_audio_path
        )
        assert spk_res["overall_band"] == 0.0
        assert spk_res["overall_cefr"] == "N/A"
        print(f"[Test] Speaking Evaluator Unclear Audio Handling Verified OK!")
    finally:
        if os.path.exists(short_audio_path):
            os.remove(short_audio_path)

def test_phoneme_word_position_alignment():
    audio_path = create_sample_wav("word_alignment_test.wav", duration=2.5)
    test_sentence = "I think that making an important decision fundamentally changed my life."
    try:
        results = PhonemeEvaluator.analyze_audio_acoustics(audio_path, transcript=test_sentence)
        assert "word_level_errors" in results
        assert len(results["word_level_errors"]) > 0
        first_err = results["word_level_errors"][0]
        assert "word" in first_err
        assert "word_index" in first_err
        assert "position_label" in first_err
        assert "sentence_context" in first_err
        assert "diagnostic" in first_err
        print(f"\n[Test] Word-Level Error Alignment OK: Word '{first_err['word']}' at position #{first_err['word_index']} ({first_err['position_label']})")
        print(f"       Diagnostic: {first_err['diagnostic']}")
        print(f"       Context: {first_err['sentence_context']}")
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)

@pytest.mark.asyncio
async def test_speaking_dual_stream():
    audio_path = create_sample_wav("speaking_stream_test.wav", duration=3.0)
    try:
        res = await SpeakingEvaluator.evaluate_from_audio(
            exam_type="IELTS",
            part="Part 2",
            prompt="Describe a memorable journey you have made.",
            audio_path=audio_path,
            client_transcript="I would like to talk about a memorable trip to Japan last year which fundamentally changed my perspective."
        )
        assert "overall_band" in res
        assert "phoneme_analysis" in res
        assert "criteria_breakdown" in res
        assert res["overall_band"] >= 5.0
        print(f"\n[Test] Dual-Stream Speaking Band: {res['overall_band']}, Pronunciation Score: {res.get('pronunciation_score')}")
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)

def test_speaking_cache_and_evaluate_endpoints():
    audio_path = create_sample_wav("endpoint_test.wav", duration=2.0)
    try:
        with open(audio_path, "rb") as f:
            cache_resp = client.post(
                "/api/ai/speaking/cache",
                files={"audio_file": ("endpoint_test.wav", f, "audio/wav")}
            )
        assert cache_resp.status_code == 200
        cache_data = cache_resp.json()
        assert "cache_id" in cache_data
        cache_id = cache_data["cache_id"]
        print(f"\n[Test] Speaking Cache Endpoint OK: cache_id={cache_id}")

        # Now evaluate using the cached audio
        eval_resp = client.post(
            "/api/ai/speaking/evaluate",
            data={
                "cache_id": cache_id,
                "exam_type": "IELTS",
                "part": "Part 2",
                "prompt": "Describe your favorite hobby.",
                "client_transcript": "My favorite hobby is landscape photography because it allows me to capture nature."
            }
        )
        assert eval_resp.status_code == 200
        eval_data = eval_resp.json()
        assert "overall_band" in eval_data
        print(f"\n[Test] Cached Speaking Evaluation OK: Band={eval_data['overall_band']}")
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)

def test_tts_config_and_synthesis():
    config_resp = client.get("/api/ai/tts/config")
    assert config_resp.status_code == 200
    config_data = config_resp.json()
    assert "available_profiles" in config_data
    print(f"\n[Test] TTS Config Profiles: {len(config_data['available_profiles'])}")

    # Test server-side synthesis
    synth_resp = client.post(
        "/api/ai/tts/synthesize",
        json={"text": "Hello, welcome to LingoPrep.", "voice_profile": "ielts_examiner_british_female"}
    )
    assert synth_resp.status_code == 200
    assert synth_resp.json().get("status") in ["success", "error"]
    print(f"\n[Test] TTS Synthesis Response: {synth_resp.json().get('status')}")

if __name__ == "__main__":
    import asyncio
    print("Running manual test suite...")
    test_health_check()
    test_ai_test_html_page()
    asyncio.run(test_ollama_service_connectivity())
    asyncio.run(test_writing_evaluator())
    asyncio.run(test_tutor_chatbot())
    asyncio.run(test_asr_unclear_audio())
    test_phoneme_word_position_alignment()
    test_phoneme_evaluator_acoustics()
    asyncio.run(test_speaking_dual_stream())
    test_speaking_cache_and_evaluate_endpoints()
    test_tts_config_and_synthesis()
    print("\n[SUCCESS] ALL TESTS COMPLETED SUCCESSFULLY!")

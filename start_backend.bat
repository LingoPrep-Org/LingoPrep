@echo off
echo ====================================================
echo Starting LingoPrep Backend (FastAPI + AI Engine)...
echo ====================================================
cd BE
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause

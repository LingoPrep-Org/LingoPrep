import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seeds.seed_data import seed_database
from app.routers import (
    auth, questions, submissions, reviews, dashboard, chat, admin, ai_test
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("lingoprep")

def initialize_database():
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database Tables & Seed
    initialize_database()

    yield
    # Shutdown
    logger.info("Shutting down LingoPrep Backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Intelligent IELTS & Aptis Speaking & Writing Practice & Assessment Platform powered by AI",
    openapi_tags=[
        {"name": "Authentication", "description": "JWT authentication, registration, profile, and RBAC identity."},
        {"name": "Question Bank", "description": "IELTS/Aptis Speaking and Writing prompt bank with filters and admin CRUD."},
        {"name": "Submissions & Assessments", "description": "Learner writing/speaking submissions, AI feedback, jobs, and review requests."},
        {"name": "Teacher Review Module", "description": "Teacher queue, override scoring, feedback notes, and learner notifications."},
        {"name": "Dashboard & Analytics", "description": "Learner progress, trend history, recommendations, and notifications."},
        {"name": "Administration & Monitoring", "description": "Users, roles, rubrics, AI profiles, jobs, audit logs, and system stats."},
        {"name": "AI Studio", "description": "Standalone AI/STT/TTS test and debug endpoints."},
    ],
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(submissions.router)
app.include_router(reviews.router)
app.include_router(dashboard.router)
app.include_router(chat.router)
app.include_router(admin.router)
app.include_router(ai_test.router)

# Keep TestClient/import-mode usage safe even when lifespan is not entered.
initialize_database()

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health():
    return {"status": "healthy", "database": "connected"}

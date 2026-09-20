import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger(__name__)

def create_db_engine():
    """
    Initializes database engine. Attempts PostgreSQL connection first;
    if unavailable (e.g. docker not running), falls back seamlessly to SQLite.
    """
    try:
        eng = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20
        )
        with eng.connect() as conn:
            pass
        logger.info(f"Connected to PostgreSQL database: {settings.DATABASE_URL.split('@')[-1]}")
        return eng
    except Exception as e:
        logger.warning(
            f"PostgreSQL connection failed ({e}). "
            "Falling back to local SQLite database (sqlite:///./lingoprep.db) for local development."
        )
        return create_engine("sqlite:///./lingoprep.db", connect_args={"check_same_thread": False})

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

-- LingoPrep PostgreSQL init hook for docker-compose.
-- Full schema is kept in ../migrations/001_initial_schema.sql.
-- FastAPI also runs SQLAlchemy create_all + seed data on startup for demo speed.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

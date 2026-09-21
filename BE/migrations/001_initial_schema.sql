-- LingoPrep MVP initial PostgreSQL schema.
-- Apply on a fresh database with: psql "$DATABASE_URL" -f BE/migrations/001_initial_schema.sql

CREATE TYPE userrole AS ENUM ('LEARNER', 'TEACHER', 'ADMIN');
CREATE TYPE examtype AS ENUM ('IELTS', 'APTIS');
CREATE TYPE skilltype AS ENUM ('SPEAKING', 'WRITING');
CREATE TYPE submissionstatus AS ENUM ('PENDING', 'PROCESSING', 'EVALUATED', 'REVIEW_REQUESTED', 'REVIEWED');
CREATE TYPE assessmentjobstatus AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  hashed_password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role userrole NOT NULL DEFAULT 'LEARNER',
  avatar_url VARCHAR(500),
  target_exam VARCHAR(50) DEFAULT 'IELTS',
  target_score VARCHAR(50) DEFAULT '7.0',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ix_users_email ON users(email);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  exam_type examtype NOT NULL,
  skill skilltype NOT NULL,
  part VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  topic VARCHAR(100) DEFAULT 'General',
  difficulty VARCHAR(50) DEFAULT 'Medium',
  prompt TEXT NOT NULL,
  instructions TEXT,
  image_url VARCHAR(500),
  prep_time_seconds INTEGER DEFAULT 60,
  time_limit_seconds INTEGER DEFAULT 120,
  min_words INTEGER,
  max_words INTEGER,
  sample_answer TEXT,
  rubric_criteria JSONB,
  tags JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ix_questions_exam_type ON questions(exam_type);
CREATE INDEX ix_questions_skill ON questions(skill);

CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  submission_type skilltype NOT NULL,
  content_text TEXT,
  audio_path VARCHAR(500),
  duration_seconds INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  status submissionstatus DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ix_submissions_user_id ON submissions(user_id);
CREATE INDEX ix_submissions_question_id ON submissions(question_id);
CREATE INDEX ix_submissions_status ON submissions(status);
CREATE INDEX ix_submissions_created_at ON submissions(created_at);

CREATE TABLE assessments (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  overall_band DOUBLE PRECISION NOT NULL,
  overall_cefr VARCHAR(10) NOT NULL,
  fluency_score DOUBLE PRECISION,
  lexical_score DOUBLE PRECISION,
  grammar_score DOUBLE PRECISION,
  pronunciation_score DOUBLE PRECISION,
  task_response_score DOUBLE PRECISION,
  coherence_score DOUBLE PRECISION,
  criteria_breakdown JSONB,
  strengths JSONB DEFAULT '[]'::jsonb,
  weaknesses JSONB DEFAULT '[]'::jsonb,
  inline_feedback JSONB DEFAULT '[]'::jsonb,
  model_answer TEXT,
  recommendations JSONB DEFAULT '[]'::jsonb,
  raw_ai_response TEXT,
  evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teacher_reviews (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL REFERENCES users(id),
  overall_band DOUBLE PRECISION NOT NULL,
  overall_cefr VARCHAR(10) NOT NULL,
  criteria_scores JSONB,
  teacher_notes TEXT NOT NULL,
  is_overridden BOOLEAN DEFAULT FALSE,
  reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) DEFAULT 'Practice Session',
  persona VARCHAR(50) DEFAULT 'IELTS_EXAMINER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  audio_path VARCHAR(500),
  corrections JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'SYSTEM',
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rubrics (
  id SERIAL PRIMARY KEY,
  exam_type examtype NOT NULL,
  skill skilltype NOT NULL,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50) DEFAULT '1.0',
  criteria JSONB NOT NULL,
  cefr_mapping JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ix_rubrics_exam_skill ON rubrics(exam_type, skill);
CREATE INDEX ix_rubrics_is_active ON rubrics(is_active);

CREATE TABLE ai_profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(100) DEFAULT 'local',
  model_name VARCHAR(255) NOT NULL,
  purpose VARCHAR(100) NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ix_ai_profiles_provider ON ai_profiles(provider);
CREATE INDEX ix_ai_profiles_is_active ON ai_profiles(is_active);

CREATE TABLE assessment_jobs (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  job_type VARCHAR(50) NOT NULL,
  status assessmentjobstatus DEFAULT 'QUEUED',
  provider VARCHAR(100) DEFAULT 'local',
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ix_assessment_jobs_submission_id ON assessment_jobs(submission_id);
CREATE INDEX ix_assessment_jobs_status ON assessment_jobs(status);
CREATE INDEX ix_assessment_jobs_created_at ON assessment_jobs(created_at);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  actor_user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100),
  metadata_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ix_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX ix_audit_logs_action ON audit_logs(action);
CREATE INDEX ix_audit_logs_created_at ON audit_logs(created_at);

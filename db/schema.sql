CREATE TABLE school_years (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE classes (
  id UUID PRIMARY KEY,
  school_year_id UUID NOT NULL REFERENCES school_years(id),
  name TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '국어',
  grade_level INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE teacher_class_permissions (
  id UUID PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES users(id),
  class_id UUID NOT NULL REFERENCES classes(id),
  permission_level TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, class_id)
);

CREATE TABLE students (
  id UUID PRIMARY KEY,
  display_name TEXT NOT NULL,
  student_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE student_private_notes (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id),
  class_id UUID NOT NULL REFERENCES classes(id),
  author_id UUID NOT NULL REFERENCES users(id),
  note_type TEXT NOT NULL,
  encrypted_content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE class_enrollments (
  id UUID PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES classes(id),
  student_id UUID NOT NULL REFERENCES students(id),
  UNIQUE (class_id, student_id)
);

CREATE TABLE curriculum_units (
  id UUID PRIMARY KEY,
  school_year_id UUID NOT NULL REFERENCES school_years(id),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE achievement_standards (
  id UUID PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES curriculum_units(id),
  code TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE source_documents (
  id UUID PRIMARY KEY,
  class_id UUID REFERENCES classes(id),
  unit_id UUID REFERENCES curriculum_units(id),
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  storage_uri TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE document_pages (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES source_documents(id),
  page_number INTEGER NOT NULL,
  ocr_text TEXT,
  corrected_text TEXT,
  review_status TEXT NOT NULL DEFAULT 'pending',
  UNIQUE (document_id, page_number)
);

CREATE TABLE learning_evidence (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  class_id UUID NOT NULL REFERENCES classes(id),
  standard_id UUID REFERENCES achievement_standards(id),
  source_page_id UUID REFERENCES document_pages(id),
  evidence_type TEXT NOT NULL,
  content TEXT NOT NULL,
  observed_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rubrics (
  id UUID PRIMARY KEY,
  standard_id UUID REFERENCES achievement_standards(id),
  title TEXT NOT NULL,
  description TEXT
);

CREATE TABLE rubric_levels (
  id UUID PRIMARY KEY,
  rubric_id UUID NOT NULL REFERENCES rubrics(id),
  level_order INTEGER NOT NULL,
  label TEXT NOT NULL,
  descriptor TEXT NOT NULL
);

CREATE TABLE evaluations (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id),
  rubric_id UUID NOT NULL REFERENCES rubrics(id),
  rubric_level_id UUID REFERENCES rubric_levels(id),
  teacher_comment TEXT,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE evaluation_evidence_links (
  evaluation_id UUID NOT NULL REFERENCES evaluations(id),
  evidence_id UUID NOT NULL REFERENCES learning_evidence(id),
  PRIMARY KEY (evaluation_id, evidence_id)
);

CREATE TABLE record_drafts (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id),
  class_id UUID NOT NULL REFERENCES classes(id),
  draft_text TEXT NOT NULL,
  final_text TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  generated_by TEXT NOT NULL DEFAULT 'ai_assisted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ
);

CREATE TABLE record_draft_evidence_links (
  record_draft_id UUID NOT NULL REFERENCES record_drafts(id),
  evidence_id UUID NOT NULL REFERENCES learning_evidence(id),
  PRIMARY KEY (record_draft_id, evidence_id)
);

CREATE TABLE assessments (
  id UUID PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES classes(id),
  title TEXT NOT NULL,
  opens_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE questions (
  id UUID PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES assessments(id),
  standard_id UUID REFERENCES achievement_standards(id),
  question_order INTEGER NOT NULL,
  question_type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  answer_key TEXT,
  points NUMERIC(5, 2) NOT NULL DEFAULT 1
);

CREATE TABLE student_attempts (
  id UUID PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES assessments(id),
  student_id UUID NOT NULL REFERENCES students(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ
);

CREATE TABLE student_responses (
  id UUID PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES student_attempts(id),
  question_id UUID NOT NULL REFERENCES questions(id),
  response_text TEXT,
  is_correct BOOLEAN,
  score NUMERIC(5, 2),
  answered_at TIMESTAMPTZ
);

CREATE TABLE response_events (
  id UUID PRIMARY KEY,
  response_id UUID NOT NULL REFERENCES student_responses(id),
  event_type TEXT NOT NULL,
  event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE analytics_algorithms (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  description TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, version)
);

CREATE TABLE student_insights (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id),
  class_id UUID NOT NULL REFERENCES classes(id),
  algorithm_id UUID REFERENCES analytics_algorithms(id),
  insight_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE student_access_codes (
  id UUID PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES assessments(id),
  student_id UUID REFERENCES students(id),
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  actor_user_id UUID REFERENCES users(id),
  actor_student_id UUID REFERENCES students(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_requests (
  id UUID PRIMARY KEY,
  requested_by UUID NOT NULL REFERENCES users(id),
  purpose TEXT NOT NULL,
  anonymized_payload JSONB NOT NULL,
  provider TEXT NOT NULL,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

import json
import os
import sqlite3
import uuid
from pathlib import Path
from typing import Any, Protocol

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
STORAGE_DIR = BASE_DIR / "storage"
DB_PATH = DATA_DIR / "class_learning_record.sqlite3"


def load_local_env() -> None:
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_local_env()
DATABASE_URL = os.getenv("DATABASE_URL", "")
TEACHER_LOGIN_ID = os.getenv("TEACHER_LOGIN_ID", "korean").strip() or "korean"
TEACHER_LOGIN_PASSWORD = os.getenv("TEACHER_LOGIN_PASSWORD", "").strip()


class DatabaseConnection(Protocol):
    def execute(self, sql: str, parameters: tuple[Any, ...] = ()) -> Any: ...
    def executescript(self, sql: str) -> Any: ...
    def __enter__(self) -> "DatabaseConnection": ...
    def __exit__(self, exc_type: object, exc: object, traceback: object) -> None: ...


class PostgresConnection:
    def __init__(self, database_url: str):
        import psycopg
        from psycopg.rows import dict_row

        self.connection = psycopg.connect(database_url, row_factory=dict_row)

    def execute(self, sql: str, parameters: tuple[Any, ...] = ()) -> Any:
        return self.connection.execute(sql.replace("?", "%s"), parameters)

    def executescript(self, sql: str) -> None:
        for statement in sql.split(";"):
            if statement.strip():
                self.execute(statement)

    def __enter__(self) -> "PostgresConnection":
        return self

    def __exit__(self, exc_type: object, exc: object, traceback: object) -> None:
        if exc_type:
            self.connection.rollback()
        else:
            self.connection.commit()
        self.connection.close()


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def get_connection() -> DatabaseConnection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    if DATABASE_URL.startswith(("postgres://", "postgresql://")):
        return PostgresConnection(DATABASE_URL)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def row_to_dict(row: Any | None) -> dict[str, Any] | None:
    if row is None:
        return None
    return dict(row)


def rows_to_dicts(rows: list[Any]) -> list[dict[str, Any]]:
    return [dict(row) for row in rows]


def encode_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False)


def decode_json(value: str | None, fallback: Any) -> Any:
    if not value:
        return fallback
    return json.loads(value)


def init_db() -> None:
    with get_connection() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
              id TEXT PRIMARY KEY,
              email TEXT NOT NULL UNIQUE,
              display_name TEXT NOT NULL,
              password_hash TEXT NOT NULL,
              role TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS sessions (
              token TEXT PRIMARY KEY,
              user_id TEXT NOT NULL REFERENCES users(id),
              expires_at TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS school_classes (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              school_year TEXT NOT NULL,
              grade_level TEXT NOT NULL,
              subject TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS teacher_class_permissions (
              user_id TEXT NOT NULL REFERENCES users(id),
              class_id TEXT NOT NULL REFERENCES school_classes(id),
              permission_level TEXT NOT NULL,
              PRIMARY KEY (user_id, class_id)
            );

            CREATE TABLE IF NOT EXISTS students (
              id TEXT PRIMARY KEY,
              class_id TEXT NOT NULL REFERENCES school_classes(id),
              grade_level TEXT,
              class_name TEXT,
              number TEXT NOT NULL,
              name TEXT NOT NULL,
              note TEXT,
              tags TEXT NOT NULL DEFAULT '[]',
              evidence_count INTEGER NOT NULL DEFAULT 0,
              evaluation TEXT NOT NULL DEFAULT '미입력',
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS source_documents (
              id TEXT PRIMARY KEY,
              class_id TEXT NOT NULL REFERENCES school_classes(id),
              title TEXT NOT NULL,
              unit TEXT NOT NULL,
              original_filename TEXT NOT NULL,
              storage_path TEXT NOT NULL,
              status TEXT NOT NULL,
              uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS document_pages (
              id TEXT PRIMARY KEY,
              document_id TEXT NOT NULL REFERENCES source_documents(id),
              page_number INTEGER NOT NULL,
              ocr_text TEXT NOT NULL,
              corrected_text TEXT NOT NULL,
              reviewed INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS standards (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              score INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS rubrics (
              id TEXT PRIMARY KEY,
              standard_id TEXT NOT NULL REFERENCES standards(id),
              title TEXT NOT NULL,
              levels TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS assessments (
              id TEXT PRIMARY KEY,
              class_id TEXT NOT NULL REFERENCES school_classes(id),
              standard_id TEXT NOT NULL REFERENCES standards(id),
              title TEXT NOT NULL,
              code_hash TEXT NOT NULL,
              code_hint TEXT NOT NULL,
              status TEXT NOT NULL,
              questions TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS attempts (
              id TEXT PRIMARY KEY,
              assessment_id TEXT NOT NULL REFERENCES assessments(id),
              student_id TEXT REFERENCES students(id),
              student_name TEXT NOT NULL,
              score INTEGER NOT NULL,
              total INTEGER NOT NULL,
              duration_seconds INTEGER NOT NULL,
              changed_answers INTEGER NOT NULL,
              responses TEXT NOT NULL,
              events TEXT NOT NULL,
              submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS record_drafts (
              id TEXT PRIMARY KEY,
              class_id TEXT NOT NULL REFERENCES school_classes(id),
              student_id TEXT NOT NULL REFERENCES students(id),
              draft_text TEXT NOT NULL,
              status TEXT NOT NULL,
              evidence TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              approved_at TEXT
            );

            CREATE TABLE IF NOT EXISTS audit_logs (
              id TEXT PRIMARY KEY,
              actor_type TEXT NOT NULL,
              actor_id TEXT,
              action TEXT NOT NULL,
              target TEXT NOT NULL,
              metadata TEXT NOT NULL DEFAULT '{}',
              occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS ai_requests (
              id TEXT PRIMARY KEY,
              requested_by TEXT NOT NULL REFERENCES users(id),
              purpose TEXT NOT NULL,
              anonymized_payload TEXT NOT NULL,
              provider TEXT NOT NULL,
              model TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        ensure_student_columns(db)
        seed_demo_data(db)
        ensure_teacher_account(db)


def ensure_student_columns(db: DatabaseConnection) -> None:
    if DATABASE_URL.startswith(("postgres://", "postgresql://")):
        statements = (
            "ALTER TABLE students ADD COLUMN IF NOT EXISTS grade_level TEXT",
            "ALTER TABLE students ADD COLUMN IF NOT EXISTS class_name TEXT",
            "ALTER TABLE students ADD COLUMN IF NOT EXISTS note TEXT",
        )
    else:
        statements = (
            "ALTER TABLE students ADD COLUMN grade_level TEXT",
            "ALTER TABLE students ADD COLUMN class_name TEXT",
            "ALTER TABLE students ADD COLUMN note TEXT",
        )
    for statement in statements:
        try:
            db.execute(statement)
        except Exception:
            pass


def ensure_teacher_account(db: DatabaseConnection) -> None:
    from app.core.security import hash_secret

    class_id = "class_2026_2_3"
    teacher_id = "user_teacher_demo"
    class_row = db.execute("SELECT id FROM school_classes WHERE id = ?", (class_id,)).fetchone()
    if not class_row:
        db.execute(
            "INSERT INTO school_classes (id, name, school_year, grade_level, subject) VALUES (?, ?, ?, ?, ?)",
            (class_id, "3반", "2026학년도", "2학년", "국어"),
        )

    user_row = db.execute("SELECT id FROM users WHERE id = ?", (teacher_id,)).fetchone()
    if user_row:
        if TEACHER_LOGIN_PASSWORD:
            db.execute(
                "UPDATE users SET email = ?, display_name = ?, password_hash = ?, role = ? WHERE id = ?",
                (TEACHER_LOGIN_ID, "국어 선생님", hash_secret(TEACHER_LOGIN_PASSWORD), "teacher", teacher_id),
            )
        else:
            db.execute(
                "UPDATE users SET email = ?, display_name = ?, role = ? WHERE id = ?",
                (TEACHER_LOGIN_ID, "국어 선생님", "teacher", teacher_id),
            )
    else:
        password_hash = hash_secret(TEACHER_LOGIN_PASSWORD or new_id("disabled_password"))
        db.execute(
            "INSERT INTO users (id, email, display_name, password_hash, role) VALUES (?, ?, ?, ?, ?)",
            (teacher_id, TEACHER_LOGIN_ID, "국어 선생님", password_hash, "teacher"),
        )

    permission = db.execute(
        "SELECT 1 FROM teacher_class_permissions WHERE user_id = ? AND class_id = ?",
        (teacher_id, class_id),
    ).fetchone()
    if not permission:
        db.execute(
            "INSERT INTO teacher_class_permissions (user_id, class_id, permission_level) VALUES (?, ?, ?)",
            (teacher_id, class_id, "owner"),
        )
    db.execute("DELETE FROM sessions WHERE user_id = ?", (teacher_id,))


def seed_demo_data(db: DatabaseConnection) -> None:
    from app.core.security import hash_secret

    user_count = db.execute("SELECT COUNT(*) AS count FROM users").fetchone()["count"]
    if user_count:
        return

    class_id = "class_2026_2_3"
    teacher_id = "user_teacher_demo"
    db.execute(
        "INSERT INTO users (id, email, display_name, password_hash, role) VALUES (?, ?, ?, ?, ?)",
        (teacher_id, TEACHER_LOGIN_ID, "국어 선생님", hash_secret(TEACHER_LOGIN_PASSWORD or new_id("disabled_password")), "teacher"),
    )
    db.execute(
        "INSERT INTO school_classes (id, name, school_year, grade_level, subject) VALUES (?, ?, ?, ?, ?)",
        (class_id, "3반", "2026학년도", "2학년", "국어"),
    )
    db.execute(
        "INSERT INTO teacher_class_permissions (user_id, class_id, permission_level) VALUES (?, ?, ?)",
        (teacher_id, class_id, "owner"),
    )

    students = [
        ("stu_01", "01", "김민준", ["발표 보완"], 1, "B"),
        ("stu_02", "02", "이서연", ["쓰기 강점"], 3, "A"),
        ("stu_03", "03", "박도윤", ["풀이 로그 부족"], 0, "미입력"),
        ("stu_04", "04", "최하린", ["근거 제시 우수"], 4, "A"),
    ]
    for student_id, number, name, tags, evidence_count, evaluation in students:
        db.execute(
            """
            INSERT INTO students (id, class_id, number, name, tags, evidence_count, evaluation)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (student_id, class_id, number, name, encode_json(tags), evidence_count, evaluation),
        )

    standards = [
        ("std_01", "토의에서 타당한 근거를 들어 의견을 제시한다.", 74),
        ("std_02", "글의 구조를 고려하여 핵심 내용을 요약한다.", 61),
        ("std_03", "매체 자료의 관점과 표현 방식을 분석한다.", 47),
    ]
    for standard_id, title, score in standards:
        db.execute("INSERT INTO standards (id, title, score) VALUES (?, ?, ?)", (standard_id, title, score))

    levels = [
        {"label": "A", "text": "주장과 근거가 명확하며 상대 의견을 고려해 조정한다."},
        {"label": "B", "text": "주장과 근거를 연결하지만 일부 근거의 타당성이 부족하다."},
        {"label": "C", "text": "주장은 제시하나 근거가 부족하거나 관련성이 약하다."},
    ]
    db.execute(
        "INSERT INTO rubrics (id, standard_id, title, levels) VALUES (?, ?, ?, ?)",
        ("rubric_01", "std_01", "토의 근거 제시", encode_json(levels)),
    )

    questions = [
        {
            "id": "q1",
            "type": "choice",
            "prompt": "토의에서 타당한 근거가 필요한 까닭으로 가장 알맞은 것은?",
            "options": ["주장을 더 설득력 있게 만들기 위해서", "말하는 시간을 줄이기 위해서", "상대 의견을 기록하지 않기 위해서"],
            "answer": "주장을 더 설득력 있게 만들기 위해서",
        },
        {
            "id": "q2",
            "type": "short",
            "prompt": "주장과 근거를 연결할 때 확인해야 할 점을 한 문장으로 쓰세요.",
            "answer": "근거가 주장과 관련 있고 믿을 만한지 확인한다.",
        },
    ]
    db.execute(
        """
        INSERT INTO assessments (id, class_id, standard_id, title, code_hash, code_hint, status, questions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        ("as_01", class_id, "std_01", "토의와 근거 형성평가", hash_secret("KOR-2026-01"), "KOR-2026-01", "배포 중", encode_json(questions)),
    )


def audit_log(actor_type: str, actor_id: str | None, action: str, target: str, metadata: dict[str, Any] | None = None) -> None:
    with get_connection() as db:
        db.execute(
            """
            INSERT INTO audit_logs (id, actor_type, actor_id, action, target, metadata)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (new_id("audit"), actor_type, actor_id, action, target, encode_json(metadata or {})),
        )

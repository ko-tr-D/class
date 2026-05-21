from pathlib import Path
from time import monotonic
from typing import Any

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from pydantic import BaseModel

from app.core.database import (
    STORAGE_DIR,
    audit_log,
    decode_json,
    encode_json,
    get_connection,
    new_id,
    row_to_dict,
    rows_to_dicts,
)
from app.core.security import anonymize_for_ai, hash_secret, issue_token, verify_secret

router = APIRouter()


class TeacherLoginRequest(BaseModel):
    email: str
    password: str


class StudentJoinRequest(BaseModel):
    code: str
    student_name: str


class StudentCreateRequest(BaseModel):
    class_id: str = "class_2026_2_3"
    number: str
    name: str
    tag: str | None = None


class RubricCreateRequest(BaseModel):
    standard_id: str
    title: str
    levels: list[dict[str, str]]


class AssessmentCreateRequest(BaseModel):
    class_id: str = "class_2026_2_3"
    standard_id: str
    title: str
    code: str
    questions: list[dict[str, Any]]


class AttemptSubmitRequest(BaseModel):
    assessment_id: str
    student_name: str
    responses: dict[str, str]
    changed_answers: int = 0
    started_at_ms: int | None = None


class EvaluationUpdateRequest(BaseModel):
    student_id: str
    rubric_level: str


class RecordDraftCreateRequest(BaseModel):
    student_id: str
    class_id: str = "class_2026_2_3"


def require_teacher(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing teacher session")
    token = authorization.removeprefix("Bearer ").strip()
    with get_connection() as db:
        row = db.execute(
            """
            SELECT users.* FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.token = ?
            """,
            (token,),
        ).fetchone()
    user = row_to_dict(row)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid teacher session")
    return user


def verify_class_permission(user_id: str, class_id: str) -> None:
    with get_connection() as db:
        row = db.execute(
            "SELECT 1 FROM teacher_class_permissions WHERE user_id = ? AND class_id = ?",
            (user_id, class_id),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=403, detail="No permission for this class")


@router.get("/structure")
def structure() -> dict[str, list[str]]:
    return {
        "teacher": ["dashboard", "classes", "documents", "ocr_review", "rubrics", "student_records", "assessments", "analytics", "record_drafts"],
        "student": ["join", "assessment_player", "submission", "feedback"],
        "security": ["teacher_email_login", "student_access_code", "authorization", "audit_logs", "data_anonymization"],
    }


@router.post("/auth/login")
def teacher_login(payload: TeacherLoginRequest) -> dict[str, str]:
    with get_connection() as db:
        user = row_to_dict(db.execute("SELECT * FROM users WHERE email = ?", (payload.email,)).fetchone())
        if not user or not verify_secret(payload.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        token, expires_at = issue_token()
        db.execute("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)", (token, user["id"], expires_at))
    audit_log("teacher", user["id"], "teacher_login", user["email"])
    return {"token_type": "bearer", "access_token": token, "email": user["email"], "role": user["role"], "display_name": user["display_name"]}


@router.get("/dashboard")
def dashboard(user: dict[str, Any] = Depends(require_teacher)) -> dict[str, Any]:
    with get_connection() as db:
        class_row = row_to_dict(db.execute("SELECT * FROM school_classes LIMIT 1").fetchone())
        verify_class_permission(user["id"], class_row["id"])
        students = rows_to_dicts(db.execute("SELECT * FROM students WHERE class_id = ? ORDER BY number", (class_row["id"],)).fetchall())
        documents = rows_to_dicts(db.execute("SELECT * FROM source_documents WHERE class_id = ? ORDER BY uploaded_at DESC", (class_row["id"],)).fetchall())
        standards = rows_to_dicts(db.execute("SELECT * FROM standards").fetchall())
        rubrics = rows_to_dicts(db.execute("SELECT * FROM rubrics").fetchall())
        assessments = rows_to_dicts(db.execute("SELECT * FROM assessments WHERE class_id = ? ORDER BY created_at DESC", (class_row["id"],)).fetchall())
        attempts = rows_to_dicts(db.execute("SELECT * FROM attempts ORDER BY submitted_at DESC").fetchall())
        drafts = rows_to_dicts(db.execute("SELECT * FROM record_drafts WHERE class_id = ? ORDER BY created_at DESC", (class_row["id"],)).fetchall())

    for student in students:
        student["tags"] = decode_json(student.pop("tags"), [])
    with get_connection() as db:
        for document in documents:
            pages = rows_to_dicts(db.execute("SELECT * FROM document_pages WHERE document_id = ? ORDER BY page_number", (document["id"],)).fetchall())
            document["pages"] = [
                {
                    "id": page["id"],
                    "number": page["page_number"],
                    "ocr": page["ocr_text"],
                    "corrected": page["corrected_text"],
                    "reviewed": bool(page["reviewed"]),
                }
                for page in pages
            ]
    for rubric in rubrics:
        rubric["levels"] = decode_json(rubric["levels"], [])
    for assessment in assessments:
        assessment["questions"] = decode_json(assessment["questions"], [])
        assessment["code"] = assessment.pop("code_hint")
    for attempt in attempts:
        attempt["responses"] = decode_json(attempt["responses"], {})
        attempt["events"] = decode_json(attempt["events"], [])
    for draft in drafts:
        draft["text"] = draft.pop("draft_text")
        draft["evidence"] = decode_json(draft["evidence"], [])

    audit_log("teacher", user["id"], "view_dashboard", class_row["id"])
    return {
        "teacher": {"email": user["email"], "name": user["display_name"], "role": user["role"]},
        "classInfo": {"id": class_row["id"], "year": class_row["school_year"], "grade": class_row["grade_level"], "name": class_row["name"], "subject": class_row["subject"]},
        "students": students,
        "documents": documents,
        "standards": standards,
        "rubrics": rubrics,
        "assessments": assessments,
        "attempts": attempts,
        "recordDrafts": drafts,
    }


@router.post("/student-sessions")
def student_join(payload: StudentJoinRequest) -> dict[str, Any]:
    code_hash = hash_secret(payload.code)
    with get_connection() as db:
        assessment = row_to_dict(db.execute("SELECT * FROM assessments WHERE code_hash = ? AND status = '배포 중'", (code_hash,)).fetchone())
    if not assessment:
        raise HTTPException(status_code=404, detail="Invalid or expired access code")
    audit_log("student", None, "student_join", payload.code, {"student_name": payload.student_name})
    return {
        "session_type": "student_access_code",
        "student_name": payload.student_name,
        "assessment": {
            "id": assessment["id"],
            "title": assessment["title"],
            "questions": decode_json(assessment["questions"], []),
        },
        "started_at_ms": int(monotonic() * 1000),
    }


@router.post("/students")
def create_student(payload: StudentCreateRequest, user: dict[str, Any] = Depends(require_teacher)) -> dict[str, Any]:
    verify_class_permission(user["id"], payload.class_id)
    student_id = new_id("student")
    tags = [payload.tag] if payload.tag else ["관찰 필요"]
    with get_connection() as db:
        db.execute(
            """
            INSERT INTO students (id, class_id, number, name, tags)
            VALUES (?, ?, ?, ?, ?)
            """,
            (student_id, payload.class_id, payload.number, payload.name, encode_json(tags)),
        )
    audit_log("teacher", user["id"], "create_student", payload.name)
    return {"id": student_id, "class_id": payload.class_id, "number": payload.number, "name": payload.name, "tags": tags, "evidence_count": 0, "evaluation": "미입력"}


@router.post("/documents")
async def upload_document(
    title: str = Form(...),
    unit: str = Form(...),
    class_id: str = Form("class_2026_2_3"),
    file: UploadFile = File(...),
    user: dict[str, Any] = Depends(require_teacher),
) -> dict[str, Any]:
    verify_class_permission(user["id"], class_id)
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    document_id = new_id("document")
    document_dir = STORAGE_DIR / "documents"
    document_dir.mkdir(parents=True, exist_ok=True)
    storage_path = document_dir / f"{document_id}_{Path(file.filename).name}"
    storage_path.write_bytes(await file.read())

    ocr_text = extract_demo_ocr_text(title, unit)
    page_id = new_id("page")
    with get_connection() as db:
        db.execute(
            """
            INSERT INTO source_documents (id, class_id, title, unit, original_filename, storage_path, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (document_id, class_id, title, unit, file.filename, str(storage_path), "검수 대기"),
        )
        db.execute(
            """
            INSERT INTO document_pages (id, document_id, page_number, ocr_text, corrected_text)
            VALUES (?, ?, ?, ?, ?)
            """,
            (page_id, document_id, 1, ocr_text, ocr_text),
        )
    audit_log("teacher", user["id"], "upload_document", title)
    return {"id": document_id, "title": title, "unit": unit, "fileName": file.filename, "status": "검수 대기", "pages": [{"id": page_id, "number": 1, "ocr": ocr_text, "corrected": ocr_text, "reviewed": False}]}


@router.patch("/documents/{document_id}/pages/{page_id}")
def review_page(document_id: str, page_id: str, corrected_text: dict[str, str], user: dict[str, Any] = Depends(require_teacher)) -> dict[str, str]:
    with get_connection() as db:
        document = row_to_dict(db.execute("SELECT * FROM source_documents WHERE id = ?", (document_id,)).fetchone())
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        verify_class_permission(user["id"], document["class_id"])
        db.execute("UPDATE document_pages SET corrected_text = ?, reviewed = 1 WHERE id = ?", (corrected_text["corrected_text"], page_id))
        pending = db.execute("SELECT COUNT(*) AS count FROM document_pages WHERE document_id = ? AND reviewed = 0", (document_id,)).fetchone()["count"]
        db.execute("UPDATE source_documents SET status = ? WHERE id = ?", ("검수 완료" if pending == 0 else "검수 대기", document_id))
    audit_log("teacher", user["id"], "review_ocr_page", f"{document_id}:{page_id}")
    return {"status": "reviewed"}


@router.post("/rubrics")
def create_rubric(payload: RubricCreateRequest, user: dict[str, Any] = Depends(require_teacher)) -> dict[str, Any]:
    rubric_id = new_id("rubric")
    with get_connection() as db:
        db.execute(
            "INSERT INTO rubrics (id, standard_id, title, levels) VALUES (?, ?, ?, ?)",
            (rubric_id, payload.standard_id, payload.title, encode_json(payload.levels)),
        )
    audit_log("teacher", user["id"], "create_rubric", payload.title)
    return {"id": rubric_id, "standard_id": payload.standard_id, "title": payload.title, "levels": payload.levels}


@router.post("/assessments")
def create_assessment(payload: AssessmentCreateRequest, user: dict[str, Any] = Depends(require_teacher)) -> dict[str, Any]:
    verify_class_permission(user["id"], payload.class_id)
    assessment_id = new_id("assessment")
    with get_connection() as db:
        db.execute(
            """
            INSERT INTO assessments (id, class_id, standard_id, title, code_hash, code_hint, status, questions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (assessment_id, payload.class_id, payload.standard_id, payload.title, hash_secret(payload.code), payload.code, "배포 중", encode_json(payload.questions)),
        )
    audit_log("teacher", user["id"], "create_assessment", payload.title)
    return {"id": assessment_id, "title": payload.title, "code": payload.code, "status": "배포 중", "questions": payload.questions}


@router.post("/attempts/submit")
def submit_attempt(payload: AttemptSubmitRequest) -> dict[str, Any]:
    with get_connection() as db:
        assessment = row_to_dict(db.execute("SELECT * FROM assessments WHERE id = ?", (payload.assessment_id,)).fetchone())
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")
        student = row_to_dict(db.execute("SELECT * FROM students WHERE name = ?", (payload.student_name,)).fetchone())
        questions = decode_json(assessment["questions"], [])
        score = grade_responses(questions, payload.responses)
        duration = 210
        if payload.started_at_ms:
            duration = max(1, int(monotonic() * 1000 - payload.started_at_ms) // 1000)
        attempt_id = new_id("attempt")
        db.execute(
            """
            INSERT INTO attempts (id, assessment_id, student_id, student_name, score, total, duration_seconds, changed_answers, responses, events)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                attempt_id,
                payload.assessment_id,
                student["id"] if student else None,
                payload.student_name,
                score,
                len(questions),
                duration,
                payload.changed_answers,
                encode_json(payload.responses),
                encode_json(["assessment_started", "answer_changed", "assessment_submitted"]),
            ),
        )
    audit_log("student", student["id"] if student else None, "submit_assessment", payload.assessment_id)
    return {"id": attempt_id, "score": score, "total": len(questions), "duration_seconds": duration, "changed_answers": payload.changed_answers}


@router.post("/evaluations")
def update_evaluation(payload: EvaluationUpdateRequest, user: dict[str, Any] = Depends(require_teacher)) -> dict[str, str]:
    with get_connection() as db:
        student = row_to_dict(db.execute("SELECT * FROM students WHERE id = ?", (payload.student_id,)).fetchone())
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        verify_class_permission(user["id"], student["class_id"])
        db.execute(
            "UPDATE students SET evaluation = ?, evidence_count = CASE WHEN evidence_count = 0 THEN 1 ELSE evidence_count END WHERE id = ?",
            (payload.rubric_level, payload.student_id),
        )
    audit_log("teacher", user["id"], "update_evaluation", payload.student_id)
    return {"student_id": payload.student_id, "rubric_level": payload.rubric_level, "status": "saved"}


@router.post("/record-drafts")
def create_record_draft(payload: RecordDraftCreateRequest, user: dict[str, Any] = Depends(require_teacher)) -> dict[str, Any]:
    verify_class_permission(user["id"], payload.class_id)
    with get_connection() as db:
        student = row_to_dict(db.execute("SELECT * FROM students WHERE id = ?", (payload.student_id,)).fetchone())
        attempts = rows_to_dicts(db.execute("SELECT * FROM attempts WHERE student_id = ? ORDER BY submitted_at DESC", (payload.student_id,)).fetchall())
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        anonymized_payload = anonymize_for_ai(
            {
                "student_name": student["name"],
                "student_number": student["number"],
                "tags": decode_json(student["tags"], []),
                "evaluation": student["evaluation"],
                "attempts": attempts,
            }
        )
        draft_text = build_record_draft(student, attempts)
        draft_id = new_id("draft")
        db.execute(
            """
            INSERT INTO record_drafts (id, class_id, student_id, draft_text, status, evidence)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (draft_id, payload.class_id, payload.student_id, draft_text, "검토 대기", encode_json({"attempt_count": len(attempts), "evaluation": student["evaluation"]})),
        )
        db.execute(
            """
            INSERT INTO ai_requests (id, requested_by, purpose, anonymized_payload, provider, model)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (new_id("ai"), user["id"], "record_draft", encode_json(anonymized_payload), "local-rule-generator", "v0.1"),
        )
    audit_log("teacher", user["id"], "generate_record_draft", payload.student_id)
    return {"id": draft_id, "student_id": payload.student_id, "text": draft_text, "status": "검토 대기"}


@router.get("/analytics/classes/{class_id}")
def class_analytics(class_id: str, user: dict[str, Any] = Depends(require_teacher)) -> dict[str, Any]:
    verify_class_permission(user["id"], class_id)
    with get_connection() as db:
        attempts = rows_to_dicts(db.execute("SELECT * FROM attempts ORDER BY submitted_at DESC").fetchall())
    avg_score = sum((row["score"] / row["total"]) for row in attempts) / len(attempts) if attempts else 0
    avg_time = sum(row["duration_seconds"] for row in attempts) // len(attempts) if attempts else 0
    answer_changes = sum(row["changed_answers"] for row in attempts)
    audit_log("teacher", user["id"], "view_analytics", class_id)
    return {"average_score_percent": round(avg_score * 100), "average_time_seconds": avg_time, "answer_changes": answer_changes, "algorithm_version": "v0.1"}


@router.get("/audit-logs")
def audit_logs(user: dict[str, Any] = Depends(require_teacher)) -> list[dict[str, Any]]:
    with get_connection() as db:
        rows = rows_to_dicts(db.execute("SELECT * FROM audit_logs ORDER BY occurred_at DESC LIMIT 50").fetchall())
    audit_log("teacher", user["id"], "view_audit_logs", "audit_logs")
    return rows


def extract_demo_ocr_text(title: str, unit: str) -> str:
    return f"{unit} 자료 '{title}'에서 추출한 OCR 초안입니다. 실제 OCR 공급자 연결 전까지 검수 화면의 데이터 흐름을 확인하기 위한 텍스트입니다."


def grade_responses(questions: list[dict[str, Any]], responses: dict[str, str]) -> int:
    score = 0
    for question in questions:
        response = responses.get(question["id"], "").strip()
        if question["type"] == "choice" and response == question.get("answer"):
            score += 1
        elif question["type"] != "choice" and response:
            score += 1
    return score


def build_record_draft(student: dict[str, Any], attempts: list[dict[str, Any]]) -> str:
    tags = ", ".join(decode_json(student["tags"], []))
    if attempts:
        latest = attempts[0]
        performance = f"최근 평가에서 {latest['score']}/{latest['total']}점을 기록하고 답안 수정 {latest['changed_answers']}회를 보이며"
    else:
        performance = "수업 활동 기록을 바탕으로"
    return f"{student['name']}은 {tags} 특성이 관찰되며, {performance} 자신의 이해를 점검하려는 태도를 보임. 평가 근거를 바탕으로 강점과 보완점을 다음 활동에 반영하려는 성장이 기대됨."

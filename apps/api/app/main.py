from fastapi import FastAPI

from app.api.routes import router

app = FastAPI(title="Class Learning Record API")
app.include_router(router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/roadmap")
def roadmap() -> dict[str, list[str]]:
    return {
        "mvp": [
            "teacher auth and class permissions",
            "PDF upload",
            "OCR review",
            "rubric-based evaluation",
            "student record draft generation",
        ],
        "next": [
            "student assessment player",
            "response event logging",
            "learning pattern analytics",
        ],
        "security": [
            "role-based access control",
            "audit logging for sensitive records",
            "AI request anonymization",
        ],
    }

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.database import init_db

app = FastAPI(title="Class Learning Record API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router, prefix="/api")


@app.on_event("startup")
def startup() -> None:
    init_db()


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

import mimetypes
import os
from dataclasses import dataclass
from pathlib import Path


@dataclass
class StoredFile:
    provider: str
    file_id: str
    name: str
    uri: str
    web_url: str | None = None


def is_drive_configured() -> bool:
    credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
    root_folder_id = os.getenv("GOOGLE_DRIVE_ROOT_FOLDER_ID", "")
    return bool(credentials_path and root_folder_id and Path(credentials_path).exists())


def upload_pdf_to_drive(file_bytes: bytes, filename: str, *, title: str, unit: str) -> StoredFile:
    if not is_drive_configured():
        raise RuntimeError("Google Drive is not configured")

    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaInMemoryUpload

    credentials = service_account.Credentials.from_service_account_file(
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"],
        scopes=["https://www.googleapis.com/auth/drive.file"],
    )
    service = build("drive", "v3", credentials=credentials, cache_discovery=False)
    parent_id = ensure_folder_path(service, os.environ["GOOGLE_DRIVE_ROOT_FOLDER_ID"], ["업로드자료", unit])
    media = MediaInMemoryUpload(file_bytes, mimetype=mimetypes.guess_type(filename)[0] or "application/pdf", resumable=False)
    metadata = {
        "name": filename,
        "parents": [parent_id],
        "description": f"Class Learning Record PDF: {title}",
    }
    created = (
        service.files()
        .create(body=metadata, media_body=media, fields="id,name,webViewLink")
        .execute()
    )
    return StoredFile(
        provider="google_drive",
        file_id=created["id"],
        name=created.get("name", filename),
        uri=f"gdrive://{created['id']}",
        web_url=created.get("webViewLink"),
    )


def ensure_folder_path(service, root_folder_id: str, names: list[str]) -> str:
    parent_id = root_folder_id
    for name in names:
        existing = find_child_folder(service, parent_id, name)
        if existing:
            parent_id = existing
            continue
        folder = (
            service.files()
            .create(
                body={
                    "name": name,
                    "mimeType": "application/vnd.google-apps.folder",
                    "parents": [parent_id],
                },
                fields="id",
            )
            .execute()
        )
        parent_id = folder["id"]
    return parent_id


def find_child_folder(service, parent_id: str, name: str) -> str | None:
    safe_name = name.replace("'", "\\'")
    response = (
        service.files()
        .list(
            q=f"'{parent_id}' in parents and name = '{safe_name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
            spaces="drive",
            fields="files(id,name)",
            pageSize=1,
        )
        .execute()
    )
    files = response.get("files", [])
    return files[0]["id"] if files else None


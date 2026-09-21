from functools import lru_cache
from typing import Any, Dict, Optional

from app.config import settings


@lru_cache(maxsize=1)
def get_minio_client():
    try:
        from minio import Minio
    except Exception:
        return None
    return Minio(
        settings.OBJECT_STORAGE_ENDPOINT,
        access_key=settings.OBJECT_STORAGE_ACCESS_KEY,
        secret_key=settings.OBJECT_STORAGE_SECRET_KEY,
        secure=settings.OBJECT_STORAGE_SECURE,
    )


def object_storage_status() -> Dict[str, Any]:
    status = {
        "configured": bool(settings.OBJECT_STORAGE_ENDPOINT and settings.OBJECT_STORAGE_BUCKET),
        "endpoint": settings.OBJECT_STORAGE_ENDPOINT,
        "bucket": settings.OBJECT_STORAGE_BUCKET,
        "secure": settings.OBJECT_STORAGE_SECURE,
        "available": False,
    }
    client = get_minio_client()
    if client is None:
        status["error"] = "minio package is not installed"
        return status
    try:
        exists = client.bucket_exists(settings.OBJECT_STORAGE_BUCKET)
        if not exists:
            client.make_bucket(settings.OBJECT_STORAGE_BUCKET)
        status["available"] = True
    except Exception as exc:
        status["error"] = str(exc)
    return status


def upload_file_to_object_storage(local_path: str, object_name: str, content_type: Optional[str] = None) -> Optional[str]:
    client = get_minio_client()
    if client is None:
        return None
    try:
        if not client.bucket_exists(settings.OBJECT_STORAGE_BUCKET):
            client.make_bucket(settings.OBJECT_STORAGE_BUCKET)
        client.fput_object(
            settings.OBJECT_STORAGE_BUCKET,
            object_name,
            local_path,
            content_type=content_type or "application/octet-stream",
        )
        scheme = "https" if settings.OBJECT_STORAGE_SECURE else "http"
        return f"{scheme}://{settings.OBJECT_STORAGE_ENDPOINT}/{settings.OBJECT_STORAGE_BUCKET}/{object_name}"
    except Exception:
        return None

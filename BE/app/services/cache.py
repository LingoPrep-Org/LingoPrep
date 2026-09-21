from functools import lru_cache
from typing import Any, Dict

from app.config import settings


@lru_cache(maxsize=1)
def get_redis_client():
    try:
        import redis
    except Exception:
        return None
    return redis.Redis.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=1)


def redis_status() -> Dict[str, Any]:
    client = get_redis_client()
    status = {"configured": bool(settings.REDIS_URL), "url": settings.REDIS_URL, "available": False}
    if client is None:
        status["error"] = "redis package is not installed"
        return status
    try:
        status["available"] = bool(client.ping())
    except Exception as exc:
        status["error"] = str(exc)
    return status

import time

from app.clients.eureka import call_service
from app.config import settings

_token_cache: dict = {"access_token": None, "expires_at": 0}


async def get_technical_token() -> str:
    """
    Récupère (et met en cache) un JWT technique via client_credentials
    auprès d'Auth-Service, résolu dynamiquement via Eureka.
    """
    now = time.time()
    if _token_cache["access_token"] and _token_cache["expires_at"] > now + 30:
        return _token_cache["access_token"]

    response = await call_service(
        "AUTH-SERVICE",
        "/oauth2/token",
        method="POST",
        data={
            "grant_type": "client_credentials",
            "client_id": settings.auth_service_client_id,
            "client_secret": settings.auth_service_client_secret,
        },
        return_type="json",
    )

    _token_cache["access_token"] = response["access_token"]
    _token_cache["expires_at"] = now + response.get("expires_in", 300)
    return _token_cache["access_token"]

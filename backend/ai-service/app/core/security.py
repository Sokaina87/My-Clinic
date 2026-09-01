from fastapi import Header, HTTPException
from jose import JWTError, jwt

from app.config import settings


async def verify_user_token(authorization: str = Header(...)) -> dict:
    """
    Valide le JWT utilisateur transmis par le Gateway.
    Distinct du JWT technique utilisé par Ai-Service pour appeler les autres services.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant ou mal formé")

    token = authorization.removeprefix("Bearer ")
    try:
        payload = jwt.decode(
            token, settings.jwt_public_key, algorithms=["RS256"], options={"verify_aud": False}
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")

    return payload

from fastapi import APIRouter, HTTPException

from app.schemas.chat import AskRequest, AskResponse
from app.services.gemini_service import generate_clinical_answer

router = APIRouter()


@router.post("/agent/ask", response_model=AskResponse)
async def ask(body: AskRequest):
    try:
        reply = await generate_clinical_answer(body.message)
        return AskResponse(reply=reply)
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Assistant Gemini indisponible : {error}") from error

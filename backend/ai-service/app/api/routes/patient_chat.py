from fastapi import APIRouter, HTTPException

from app.schemas.chat import AskRequest, AskResponse
from app.services.gemini_service import generate_clinical_answer

router = APIRouter()


@router.post("/patient/ask", response_model=AskResponse)
async def ask_patient(body: AskRequest):
    """
    Agent IA spécialisé pour les patients.
    Aide les patients avec leurs dossiers, rendez-vous, symptômes, etc.
    Ne fournit pas de services médicaux professionnels.
    """
    try:
        prompt = f"[MODE PATIENT] {body.message}"
        reply = await generate_clinical_answer(prompt)
        return AskResponse(reply=reply)
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Assistant Patient indisponible : {error}") from error

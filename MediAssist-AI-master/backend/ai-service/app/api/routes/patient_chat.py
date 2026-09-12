from fastapi import APIRouter, HTTPException

from app.agent.patient_agent import build_patient_agent, ask_patient_agent
from app.schemas.chat import AskRequest, AskResponse
from app.services.gemini_service import generate_clinical_answer
from app.services.clinical_context import get_patient_clinical_context

router = APIRouter()


@router.post("/patient/ask", response_model=AskResponse)
async def ask_patient(body: AskRequest):
    try:
        context = (
            await get_patient_clinical_context(body.patient_id)
            if body.patient_id
            else "Aucun dossier patient lié à cette session. Réponds à la demande générale sans inventer de données personnelles."
        )
        reply = await generate_clinical_answer(body.message, context)
        return AskResponse(reply=reply)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(
            status_code=503, detail=f"Assistant Gemini indisponible : {error}"
        ) from error

    """
    Agent IA spécialisé pour les patients.
    Aide les patients avec leurs dossiers, rendez-vous, consultations, symptômes, etc.
    """
    try:
        agent = build_patient_agent()
        patient_info = body.patient_name or "Sofia Martin"
        pid_info = f", ID='{body.patient_id}'" if body.patient_id else ""
        context_message = f"[Contexte patient connecté : Nom='{patient_info}'{pid_info}]\nQuestion du patient : {body.message}"
        reply = await ask_patient_agent(agent, context_message)
        return AskResponse(reply=reply)
    except Exception:
        try:
            prompt = f"[MODE PATIENT - {body.patient_name or 'Sofia Martin'}] {body.message}"
            reply = await generate_clinical_answer(prompt)
            return AskResponse(reply=reply)
        except Exception as error:
            raise HTTPException(
                status_code=503, detail=f"Assistant Patient indisponible : {error}"
            ) from error

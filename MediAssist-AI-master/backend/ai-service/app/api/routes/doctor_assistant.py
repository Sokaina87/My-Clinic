from fastapi import APIRouter, HTTPException

from app.schemas.doctor_assistant import DoctorAssistantRequest, DoctorAssistantResponse, PatientAttentionItem
from app.services.gemini_service import generate_clinical_answer
from app.services.clinical_context import get_patient_clinical_context

router = APIRouter()


from app.agent.agent import build_agent, ask_agent


@router.post("/doctor-assistant", response_model=DoctorAssistantResponse)
async def doctor_assistant(body: DoctorAssistantRequest):
    question = body.question.lower()
    urgent = [p for p in body.patients if p.priority.lower() in {"high", "critical"} or p.follow_up_due == "overdue"]
    patient_context = "\n".join(
        f"- {p.name}: priorité={p.priority}; symptômes={p.symptoms}; suivi={p.follow_up_due}; dernière consultation={p.last_consultation}"
        for p in body.patients
    )
    prompt = f"Contexte des patients récents du cabinet :\n{patient_context}\n\nDemande du médecin :\n{body.question}"
    database_contexts = []
    for patient in body.patients:
        if not patient.id:
            continue
        try:
            database_contexts.append(await get_patient_clinical_context(patient.id))
        except ValueError:
            continue

    try:
        answer = await generate_clinical_answer(
            body.question,
            f"{patient_context}\n\nDonnées issues des dossiers sélectionnés :\n"
            + "\n".join(database_contexts),
        )
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Assistant Gemini indisponible : {error}") from error

    if any(term in question for term in ["attention", "aujourd'hui", "aujourd’hui"]):
        return DoctorAssistantResponse(
            intent="patients_requiring_attention",
            patients_requiring_attention=urgent,
            answer=answer,
        )
    if any(term in question for term in ["retard", "suivi"]):
        overdue = [p for p in body.patients if p.follow_up_due == "overdue"]
        return DoctorAssistantResponse(intent="overdue_follow_ups", patients_requiring_attention=overdue, answer=answer)
    return DoctorAssistantResponse(
        intent="patient_summary",
        patients_requiring_attention=urgent,
        answer=answer,
    )

    try:
        agent = build_agent()
        answer = await ask_agent(agent, prompt)
    except Exception:
        try:
            answer = await generate_clinical_answer(body.question, patient_context)
        except Exception as error:
            raise HTTPException(status_code=503, detail=f"Assistant Gemini indisponible : {error}") from error

    if any(term in question for term in ["attention", "aujourd'hui", "aujourd’hui"]):
        return DoctorAssistantResponse(
            intent="patients_requiring_attention",
            patients_requiring_attention=urgent,
            answer=answer,
        )
    if any(term in question for term in ["retard", "suivi"]):
        overdue = [p for p in body.patients if p.follow_up_due == "overdue"]
        return DoctorAssistantResponse(intent="overdue_follow_ups", patients_requiring_attention=overdue, answer=answer)
    return DoctorAssistantResponse(
        intent="patient_summary",
        patients_requiring_attention=urgent,
        answer=answer,
    )

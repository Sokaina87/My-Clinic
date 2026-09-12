from fastapi import APIRouter, HTTPException

from app.agent.patient_agent import build_patient_agent, ask_patient_agent
from app.schemas.chat import AskRequest, AskResponse
from app.services.gemini_service import generate_clinical_answer
from app.services.clinical_context import get_patient_clinical_context
from app.services.doctor_directory import doctor_directory_context, get_doctor_directory

router = APIRouter()

PATIENT_SAFETY_INSTRUCTION = """
Tu réponds à un patient, et non à un professionnel de santé. Explique les informations de
façon accessible, sans poser de diagnostic ni recommander un traitement personnalisé. Si la
question porte sur un diagnostic, une maladie possible, la cause de symptômes ou le choix
d'un traitement, indique explicitement qu'une consultation avec un médecin ou le spécialiste
approprié est nécessaire pour une évaluation fiable. En cas de signe potentiellement grave,
conseille de contacter sans attendre les urgences locales ou le service d'urgence adapté.
""".strip()


def needs_clinician_referral(message: str) -> bool:
    """Recognize questions where a patient must not rely on an AI answer alone."""
    terms = (
        "diagnostic", "diagnostiquer", "quelle maladie", "quel maladie", "quelle est la maladie",
        "qu'est-ce que j'ai", "est-ce que j'ai", "cause de", "traitement", "guérir", "soigner",
    )
    normalized = message.lower().replace("’", "'")
    return any(term in normalized for term in terms)


def asks_for_doctor(message: str) -> bool:
    text = message.lower()
    return any(term in text for term in (
        "médecin", "medecin", "medcin", "docteur", "doctor", "generaliste", "généraliste",
        "cardiolog", "dermatolog", "spécialité", "specialite", "rendez-vous", "rendez vous", "rdv",
    ))


def doctor_specialty_filter(message: str) -> str | None:
    text = message.lower()
    if "cardiolog" in text:
        return "Cardiologie"
    if "dermatolog" in text:
        return "Dermatologie"
    if "generalist" in text or "généraliste" in text:
        return "Médecine générale"
    return None


@router.post("/patient/ask", response_model=AskResponse)
async def ask_patient(body: AskRequest):
    try:
        if len(body.message.strip()) < 4:
            return AskResponse(reply="Pouvez-vous préciser votre demande ? Par exemple : « Je veux un médecin cardiologue » ou « Je veux un rendez-vous avec le Dr Jean Dupont ». ")
        if asks_for_doctor(body.message):
            doctors, _ = await get_doctor_directory()
            specialty = doctor_specialty_filter(body.message)
            if specialty:
                doctors = [doctor for doctor in doctors if doctor["specialty"] == specialty]
            if doctors:
                entries = "\n".join(
                    f"• **{doctor['name']}** — {doctor['specialty']}\n  Cabinet : {doctor['address']}"
                    for doctor in doctors
                )
                return AskResponse(reply=(
                    "**Médecins disponibles**\n" + entries +
                    "\n\n**Prendre rendez-vous**\nIndiquez le médecin choisi, la date, l'heure souhaitée et le motif. "
                    "Je vous demanderai ensuite une confirmation explicite avant d'envoyer la demande."
                ))
        context = (
            await get_patient_clinical_context(body.patient_id)
            if body.patient_id
            else "Aucun dossier patient lié à cette session. Réponds à la demande générale sans inventer de données personnelles."
        )
        directory = await doctor_directory_context()
        reply = await generate_clinical_answer(
            body.message,
            f"{context}\n\n{directory}\n\nConsignes patient :\n{PATIENT_SAFETY_INSTRUCTION}\n"
            "Si le patient demande un médecin, donne uniquement le nom, la spécialité et l'adresse du cabinet figurant dans l'annuaire fourni. "
            "Si le patient veut un rendez-vous, aide-le à choisir le médecin puis demande la date, l'heure et le motif. "
            "Explique qu'une confirmation explicite sera demandée avant la création de la demande de rendez-vous.",
        )
        if needs_clinician_referral(body.message):
            reply += (
                "\n\n**Consulter un professionnel**\n"
                "Cette réponse ne remplace pas une évaluation médicale. Pour obtenir un diagnostic "
                "fiable et une prise en charge adaptée, prenez rendez-vous avec un médecin ; il ou elle "
                "pourra vous orienter vers le spécialiste approprié si nécessaire."
            )
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

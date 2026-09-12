from fastapi import APIRouter

from app.schemas.follow_up import (
    FollowUpAssessmentRequest,
    FollowUpAssessmentResponse,
    FollowUpRequest,
    FollowUpResponse,
)
from app.services.triage_service import triage

router = APIRouter()


@router.post("/follow-up", response_model=FollowUpResponse)
async def create_follow_up(body: FollowUpRequest):
    triage_result = triage(body.symptoms) if body.symptoms.strip() else None
    reasons = list(triage_result["red_flags"]) if triage_result else []
    level = triage_result["urgency"] if triage_result else "low"
    questions = [
        "Comment vous sentez-vous depuis votre dernière consultation ?",
        "Vos symptômes se sont-ils améliorés, stabilisés ou aggravés ?",
        "Avez-vous rencontré des difficultés avec votre traitement ?",
        "Souhaitez-vous être recontacté(e) par votre équipe soignante ?",
    ]
    return FollowUpResponse(questions=questions, attention_level=level, reasons=reasons)


@router.post("/follow-up/assess", response_model=FollowUpAssessmentResponse)
async def assess_follow_up(body: FollowUpAssessmentRequest):
    text = " ".join(body.answers.values())
    result = triage(text)
    level = result["urgency"]
    reasons = result["red_flags"]
    if any(word in text.lower() for word in ["aggrav", "pas mieux", "empire", "arrêt", "arret"]):
        level = "high" if level in {"low", "medium"} else level
        reasons.append("Évolution défavorable ou difficulté signalée")
    next_step = "Une équipe soignante doit recontacter le patient." if level in {"high", "critical"} else "Programmer un suivi selon le protocole clinique."
    return FollowUpAssessmentResponse(attention_level=level, reasons=reasons, next_step=next_step)

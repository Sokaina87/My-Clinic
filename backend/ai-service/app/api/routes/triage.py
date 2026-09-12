from fastapi import APIRouter, HTTPException

from app.schemas.triage import TriageRequest, TriageResponse
from app.services.gemini_service import generate_clinical_json

router = APIRouter()


@router.post("/triage", response_model=TriageResponse)
async def triage_route(body: TriageRequest):
    prompt = f"""
Évalue les symptômes suivants uniquement comme outil de triage clinique :
{body.symptoms}

Retourne exactement ce schéma JSON :
{{
  "urgency": "low|medium|high|critical",
  "summary": "analyse clinique structurée en 3 à 5 phrases : chronologie, symptômes, facteurs de risque et raison du niveau de priorité",
  "red_flags": ["signal d'alerte éventuel"],
  "recommendation": "prochaine étape prudente",
  "disclaimer": "Cette évaluation aide à prioriser les soins et ne remplace pas un diagnostic médical."
}}
Ne fournis pas de diagnostic ni de prescription. Développe la recommandation en étapes
concrètes et prudentes (évaluation immédiate, éléments à vérifier, orientation), sans inventer
de faits. En cas de symptôme respiratoire sévère,
douleur thoracique, confusion, perte de connaissance ou danger immédiat, classe high ou critical
et recommande les urgences locales.
""".strip()
    try:
        result = await generate_clinical_json(prompt)
        return TriageResponse(**result)
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Triage Gemini indisponible : {error}") from error

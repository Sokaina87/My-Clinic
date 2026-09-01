from fastapi import APIRouter, Request

from app.schemas.triage import TriageRequest, TriageResponse
from app.agent.tools.triage_tools import triage_symptoms

router = APIRouter()


@router.post("/triage", response_model=TriageResponse)
async def triage_route(body: TriageRequest, request: Request):
    result = await triage_symptoms.ainvoke({"symptoms": body.symptoms})
    return TriageResponse(**result)

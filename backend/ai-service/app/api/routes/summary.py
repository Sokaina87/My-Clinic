from fastapi import APIRouter, Request

from app.schemas.summary import SummaryRequest, SummaryResponse
from app.agent.tools.summary_tools import summarize_medical_text

router = APIRouter()


@router.post("/summary", response_model=SummaryResponse)
async def summary_route(body: SummaryRequest, request: Request):
    summary = await summarize_medical_text.ainvoke({"text": body.text})
    return SummaryResponse(summary=summary)

from fastapi import APIRouter, Request

from app.schemas.extraction import ExtractionRequest, ExtractionResponse
from app.agent.tools.extraction_tools import extract_medical_entities

router = APIRouter()


@router.post("/extract", response_model=ExtractionResponse)
async def extract_route(body: ExtractionRequest, request: Request):
    content = await extract_medical_entities.ainvoke({"text": body.text})
    return ExtractionResponse(content=content)

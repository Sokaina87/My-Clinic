from fastapi import APIRouter, Request

from app.schemas.extraction import ExtractionRequest, ExtractionResponse
from app.services.extraction_service import extract

router = APIRouter()


@router.post("/extract", response_model=ExtractionResponse)
async def extract_route(body: ExtractionRequest, request: Request):
    content = extract(body.text)
    return ExtractionResponse(content=content)

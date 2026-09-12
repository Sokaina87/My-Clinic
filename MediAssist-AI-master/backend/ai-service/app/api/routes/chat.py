from fastapi import APIRouter, HTTPException

from app.agent.agent import build_agent, ask_agent
from app.schemas.chat import AskRequest, AskResponse
from app.services.gemini_service import generate_clinical_answer

router = APIRouter()


@router.post("/agent/ask", response_model=AskResponse)
async def ask(body: AskRequest):
    try:
        agent = build_agent()
        reply = await ask_agent(agent, body.message)
        return AskResponse(reply=reply)
    except Exception:
        try:
            reply = await generate_clinical_answer(body.message)
            return AskResponse(reply=reply)
        except Exception as error:
            raise HTTPException(
                status_code=503, detail=f"Assistant Gemini indisponible : {error}"
            ) from error

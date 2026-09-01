from fastapi import APIRouter, Request

from app.agent.agent import ask_agent
from app.schemas.chat import AskRequest, AskResponse

router = APIRouter()


@router.post("/agent/ask", response_model=AskResponse)
async def ask(body: AskRequest, request: Request):
    agent = request.app.state.agent
    reply = await ask_agent(agent, body.message)
    return AskResponse(reply=reply)
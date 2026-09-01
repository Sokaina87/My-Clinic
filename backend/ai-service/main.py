from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.agent.agent import build_agent
from app.api.routes import chat, health, triage, summary, extraction
from app.clients.eureka import deregister_from_eureka, register_with_eureka
from app.core.logging import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    app.state.agent = build_agent()
    await register_with_eureka()
    yield
    await deregister_from_eureka()


app = FastAPI(title="Ai-Service", lifespan=lifespan)

app.include_router(health.router, tags=["health"])
app.include_router(chat.router, tags=["agent"])
app.include_router(triage.router, prefix="/ai", tags=["triage"])
app.include_router(summary.router, prefix="/ai", tags=["summary"])
app.include_router(extraction.router, prefix="/ai", tags=["extraction"])

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import chat, doctor_assistant, extraction, follow_up, health, patient_chat, summary, triage
from app.clients.eureka import deregister_from_eureka, register_with_eureka
from app.config import settings
from app.core.logging import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    if settings.eureka_enabled:
        await register_with_eureka()
    yield
    if settings.eureka_enabled:
        await deregister_from_eureka()


app = FastAPI(title="Ai-Service", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    # Développement local : accepte le frontend quel que soit son port (Vite, React, etc.).
    # À remplacer par la liste stricte des domaines autorisés en production.
    allow_origin_regex=r"(null|https?://(localhost|127\.0\.0\.1)(:\d+)?)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(chat.router, tags=["agent"])
app.include_router(chat.router, prefix="/ai", tags=["agent"])
app.include_router(patient_chat.router, prefix="/ai", tags=["patient"])
app.include_router(triage.router, prefix="/ai", tags=["triage"])
app.include_router(summary.router, prefix="/ai", tags=["summary"])
app.include_router(extraction.router, prefix="/ai", tags=["extraction"])
app.include_router(follow_up.router, prefix="/ai", tags=["follow-up"])
app.include_router(doctor_assistant.router, prefix="/ai", tags=["doctor-assistant"])

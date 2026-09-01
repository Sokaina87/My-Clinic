from langchain.agents import create_agent

from app.agent.llm import get_llm
from app.agent.tools.appointment_tools import (
    create_appointment,
    get_patient_appointments,
)
from app.agent.tools.extraction_tools import extract_medical_entities
from app.agent.tools.doctor_tools import get_doctor_availability, search_doctors
from app.agent.tools.patient_tools import get_patient, search_patients
from app.agent.tools.summary_tools import summarize_medical_text
from app.agent.tools.triage_tools import triage_symptoms

SYSTEM_PROMPT = (
    "Tu es l'assistant IA de MediAssist. Tu aides à consulter les dossiers "
    "patients, vérifier la disponibilité des médecins, gérer les rendez-vous, "
    "trier les symptômes, résumer des textes médicaux et extraire des informations "
    "utiles. Utilise toujours les outils disponibles plutôt que d'inventer des informations."
)

TOOLS = [
    get_patient,
    search_patients,
    get_doctor_availability,
    search_doctors,
    create_appointment,
    get_patient_appointments,
    triage_symptoms,
    summarize_medical_text,
    extract_medical_entities,
]


def build_agent():
    llm = get_llm()
    return create_agent(model=llm, tools=TOOLS, system_prompt=SYSTEM_PROMPT)


async def ask_agent(agent, message: str) -> str:
    result = await agent.ainvoke({"messages": [{"role": "user", "content": message}]})
    content = result["messages"][-1].content

    if isinstance(content, str):
        return content

    # Certains modèles (dont Gemini via ce SDK) renvoient une liste de blocs
    # structurés, ex: [{"type": "text", "text": "..."}], au lieu d'une simple string.
    if isinstance(content, list):
        return "".join(
            block.get("text", "") for block in content if isinstance(block, dict)
        )

    return str(content)
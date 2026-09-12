from langchain.agents import create_agent

from app.agent.llm import get_llm
from app.agent.tools.appointment_tools import (
    create_appointment,
    get_patient_appointments,
)
from app.agent.tools.extraction_tools import extract_medical_entities
from app.agent.tools.patient_tools import get_patient, search_patients
from app.agent.tools.summary_tools import summarize_medical_text
from app.agent.tools.triage_tools import triage_symptoms

PATIENT_SYSTEM_PROMPT = (
    "Tu es l'assistant IA patient de MediAssist. Tu aides les patients à :"
    "- Consulter leurs propres dossiers médicaux"
    "- Gérer leurs rendez-vous"
    "- Trier leurs symptômes"
    "- Comprendre les résumés médicaux"
    "- Extraire des informations utiles de leurs dossiers"
    "Tu te concentres UNIQUEMENT sur les besoins du patient. "
    "Tu n'aides PAS avec les tâches médicales réservées aux professionnels. "
    "Utilise toujours les outils disponibles plutôt que d'inventer des informations."
)

# Outils spécifiques aux patients (excluant les outils médecin)
PATIENT_TOOLS = [
    get_patient,
    search_patients,
    create_appointment,
    get_patient_appointments,
    triage_symptoms,
    summarize_medical_text,
    extract_medical_entities,
]


def build_patient_agent():
    llm = get_llm()
    return create_agent(model=llm, tools=PATIENT_TOOLS, system_prompt=PATIENT_SYSTEM_PROMPT)


async def ask_patient_agent(agent, message: str) -> str:
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

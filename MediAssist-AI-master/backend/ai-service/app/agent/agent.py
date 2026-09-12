from langchain.agents import create_agent

from app.agent.llm import get_llm
from app.agent.tools.appointment_tools import (
    create_appointment,
    get_patient_appointments,
    get_doctor_appointments,
    get_appointments_by_date,
)
from app.agent.tools.diagnosis_tools import (
    get_patient_diagnoses,
    get_diagnosis_details,
    get_all_diagnoses,
)
from app.agent.tools.extraction_tools import extract_medical_entities
from app.agent.tools.doctor_tools import (
    get_doctor_availability,
    search_doctors,
    get_all_doctors,
)
from app.agent.tools.patient_tools import (
    get_patient,
    search_patients,
    get_all_patients,
)
from app.agent.tools.summary_tools import summarize_medical_text
from app.agent.tools.triage_tools import triage_symptoms

SYSTEM_PROMPT = (
    "Tu es l'assistant IA médical universel de MediAssist. Tu aides les médecins et les patients à :"
    "- Consulter les dossiers patients et l'historique complet des consultations et diagnostics"
    "- Consulter l'agenda et les rendez-vous des médecins et des patients"
    "- Créer de nouveaux rendez-vous"
    "- Vérifier les spécialités et disponibilités des médecins"
    "- Trier les symptômes et résumer des documents médicaux"
    "Utilise toujours les outils d'accès aux bases de données pour fournir des réponses précises."
)

TOOLS = [
    get_patient,
    search_patients,
    get_all_patients,
    get_doctor_availability,
    search_doctors,
    get_all_doctors,
    create_appointment,
    get_patient_appointments,
    get_doctor_appointments,
    get_appointments_by_date,
    get_patient_diagnoses,
    get_diagnosis_details,
    get_all_diagnoses,
    triage_symptoms,
    summarize_medical_text,
    extract_medical_entities,
]


def build_agent():
    llm = get_llm()
    return create_agent(model=llm, tools=TOOLS, system_prompt=SYSTEM_PROMPT)


def format_content_to_text(content) -> str:
    """Convert LangChain/Gemini content blocks into plain response text."""
    if content is None:
        return ""
    if isinstance(content, str):
        return content
    if isinstance(content, (list, tuple)):
        return "\n".join(
            text for item in content if (text := format_content_to_text(item))
        )
    if isinstance(content, dict):
        for key in ("text", "content", "answer", "reply"):
            if key in content and content[key] is not None:
                return format_content_to_text(content[key])
        return ""
    if hasattr(content, "text"):
        return format_content_to_text(getattr(content, "text"))
    if hasattr(content, "content"):
        return format_content_to_text(getattr(content, "content"))
    return str(content)


async def ask_agent(agent, message: str) -> str:
    result = await agent.ainvoke({"messages": [{"role": "user", "content": message}]})
    content = result["messages"][-1].content
    return format_content_to_text(content)

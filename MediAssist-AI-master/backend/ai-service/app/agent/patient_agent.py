from langchain.agents import create_agent

from app.agent.llm import get_llm
from app.agent.tools.appointment_tools import (
    create_appointment,
    get_patient_appointments,
)
from app.agent.tools.diagnosis_tools import get_patient_diagnoses
from app.agent.tools.doctor_tools import (
    get_doctor_availability,
    search_doctors,
    get_all_doctors,
)
from app.agent.tools.extraction_tools import extract_medical_entities
from app.agent.tools.patient_tools import get_patient, search_patients
from app.agent.tools.summary_tools import summarize_medical_text
from app.agent.tools.triage_tools import triage_symptoms

PATIENT_SYSTEM_PROMPT = (
    "Tu es l'assistant IA patient de MediAssist. Tu aides les patients à :"
    "- Consulter leurs propres dossiers médicaux et leurs historiques de consultations/diagnostics"
    "- Gérer leurs rendez-vous et rechercher des médecins par spécialité"
    "- Trier leurs symptômes"
    "- Comprendre les résumés médicaux et ordonnances"
    "Utilise toujours les outils d'accès aux bases de données pour répondre avec des informations exactes."
)

PATIENT_TOOLS = [
    get_patient,
    search_patients,
    get_patient_diagnoses,
    create_appointment,
    get_patient_appointments,
    search_doctors,
    get_all_doctors,
    get_doctor_availability,
    triage_symptoms,
    summarize_medical_text,
    extract_medical_entities,
]


from app.agent.agent import format_content_to_text


def build_patient_agent():
    llm = get_llm()
    return create_agent(model=llm, tools=PATIENT_TOOLS, system_prompt=PATIENT_SYSTEM_PROMPT)


async def ask_patient_agent(agent, message: str) -> str:
    result = await agent.ainvoke({"messages": [{"role": "user", "content": message}]})
    content = result["messages"][-1].content
    return format_content_to_text(content)

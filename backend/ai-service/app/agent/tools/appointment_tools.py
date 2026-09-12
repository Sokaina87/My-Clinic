from langchain_core.tools import tool

from app.clients.http_client import call_business_service
from datetime import datetime
from uuid import UUID


@tool
async def create_appointment(patient_id: str, doctor_id: str, slot: str) -> dict:
    """Crée un rendez-vous pour un patient avec un médecin sur un créneau donné (ISO 8601)."""
    dt = datetime.fromisoformat(slot)
    return await call_business_service(
        "appointment-service",
        "/api/appointments",
        method="POST",
        json={
            "patientId": patient_id,
            "doctorId": doctor_id,
            "appointmentDate": dt.date().isoformat(),   # "2026-09-05"
            "appointmentTime": dt.time().isoformat(),    # "14:30:00"
        },
    )



@tool
async def get_patient_appointments(patient_id: str) -> str:
    """Liste les rendez-vous à venir d'un patient donné. patient_id doit être un UUID valide."""
    try:
        UUID(patient_id)  # valide le format avant l'appel réseau
    except ValueError:
        return f"patient_id invalide : '{patient_id}' n'est pas un UUID valide."

    try:
        result = await call_business_service(
            "appointment-service",
            f"/api/appointments/patient/{patient_id}",
            method="GET",
        )
        return str(result)
    except Exception as e:
        return f"Erreur lors de la récupération des rendez-vous : {e}"
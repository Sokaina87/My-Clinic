"""Read-only clinical context supplied to Gemini for a single requested dossier."""

import asyncio
import json
from uuid import UUID

from app.clients.http_client import call_business_service


def _require_uuid(value: str) -> str:
    try:
        return str(UUID(value))
    except (TypeError, ValueError) as error:
        raise ValueError("L'identifiant du dossier patient est invalide.") from error


async def get_patient_clinical_context(patient_id: str) -> str:
    """Load only one patient's profile, consultations and appointments."""
    patient_id = _require_uuid(patient_id)

    async def fetch(service_name: str, path: str):
        try:
            return await asyncio.wait_for(
                call_business_service(service_name, path), timeout=3.0
            )
        except (Exception, asyncio.TimeoutError):
            return {"unavailable": True}

    patient, diagnoses, appointments = await asyncio.gather(
        fetch("PATIENT-SERVICE", f"/api/patients/{patient_id}"),
        fetch("DIAGNOSIS-SERVICE", f"/api/diagnoses/patient/{patient_id}"),
        fetch("APPOINTMENT-SERVICE", f"/api/appointments/patient/{patient_id}"),
    )

    return json.dumps(
        {
            "patient_id": patient_id,
            "patient": patient,
            "consultations": diagnoses,
            "appointments": appointments,
        },
        ensure_ascii=False,
        default=str,
    )

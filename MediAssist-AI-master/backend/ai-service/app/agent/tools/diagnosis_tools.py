from uuid import UUID
from langchain_core.tools import tool
from app.clients.http_client import call_business_service


@tool
async def get_patient_diagnoses(patient_id: str) -> str:
    """
    Récupère l'historique des consultations et diagnostics d'un patient donné.
    patient_id doit être un UUID valide.
    """
    try:
        UUID(patient_id)
    except ValueError:
        return f"patient_id invalide : '{patient_id}' n'est pas un UUID valide."

    try:
        result = await call_business_service(
            "DIAGNOSIS-SERVICE",
            f"/api/diagnoses/patient/{patient_id}",
            method="GET",
        )
        return str(result)
    except Exception as e:
        return f"Erreur lors de la récupération des consultations du patient : {e}"


@tool
async def get_diagnosis_details(diagnosis_id: str) -> str:
    """
    Récupère les détails d'une consultation / d'un diagnostic médical par son ID.
    diagnosis_id doit être un UUID valide.
    """
    try:
        UUID(diagnosis_id)
    except ValueError:
        return f"diagnosis_id invalide : '{diagnosis_id}' n'est pas un UUID valide."

    try:
        result = await call_business_service(
            "DIAGNOSIS-SERVICE",
            f"/api/diagnoses/{diagnosis_id}",
            method="GET",
        )
        return str(result)
    except Exception as e:
        return f"Erreur lors de la récupération des détails de la consultation : {e}"


@tool
async def get_all_diagnoses() -> str:
    """
    Récupère la liste de toutes les consultations / diagnostics médicaux enregistrés dans le système.
    Outil destiné principalement aux médecins.
    """
    try:
        result = await call_business_service(
            "DIAGNOSIS-SERVICE",
            "/api/diagnoses",
            method="GET",
        )
        return str(result)
    except Exception as e:
        return f"Erreur lors de la récupération de la liste des consultations : {e}"


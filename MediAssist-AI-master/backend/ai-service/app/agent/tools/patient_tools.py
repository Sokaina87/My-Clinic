from langchain_core.tools import tool

from app.clients.http_client import call_business_service


@tool
async def get_patient(patient_id: str) -> dict:
    """Récupère le dossier d'un patient à partir de son identifiant."""
    return await call_business_service("PATIENT-SERVICE", f"/api/patients/{patient_id}")


@tool
async def search_patients(name: str) -> dict:
    """Recherche des patients par nom."""
    return await call_business_service(
        "PATIENT-SERVICE", f"/api/patients/search?name={name}"
    )


@tool
async def get_all_patients() -> str:
    """Récupère la liste globale de tous les patients enregistrés."""
    try:
        result = await call_business_service("PATIENT-SERVICE", "/api/patients")
        return str(result)
    except Exception as e:
        return f"Erreur lors de la récupération de la liste des patients : {e}"

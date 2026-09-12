from langchain_core.tools import tool

from app.clients.http_client import call_business_service
from urllib.parse import quote



@tool
async def get_doctor_availability(doctor_id: str) -> str:
    """Vérifie si un médecin est actuellement disponible (actif)."""
    try:
        result = await call_business_service(
            "doctor-service",
            f"/api/doctors/{doctor_id}/available",
            method="GET",
        )
        if result:
            return "Ce médecin est actuellement disponible."
        else:
            return "Ce médecin n'est pas disponible actuellement."
    except Exception as e:
        return f"Erreur lors de la vérification de disponibilité : {e}"



SPECIALTY_MAP = {
    "généraliste": "GENERALIST",
    "médecin généraliste": "GENERALIST",
    "generalist": "GENERALIST",
    "cardiologue": "CARDIOLOGIST",
    "cardiologie": "CARDIOLOGIST",
    "cardiologist": "CARDIOLOGIST",
    "dermatologue": "DERMATOLOGIST",
    "dermatologie": "DERMATOLOGIST",
    "dermatologist": "DERMATOLOGIST",
    "pédiatre": "PEDIATRICIAN",
    "pédiatrie": "PEDIATRICIAN",
    "pediatrician": "PEDIATRICIAN",
    "dentiste": "DENTIST",
    "dentist": "DENTIST",
    "psychiatre": "PSYCHIATRIST",
    "psychiatrie": "PSYCHIATRIST",
    "psychiatrist": "PSYCHIATRIST",
    "gynécologue": "GYNECOLOGIST",
    "gynécologie": "GYNECOLOGIST",
    "gynecologist": "GYNECOLOGIST",
}

@tool
async def search_doctors(specialty: str) -> str:
    """
    Recherche des médecins par spécialité.
    specialty doit être une spécialité médicale en français (ex: cardiologue, pédiatre, dentiste).
    Spécialités disponibles : généraliste, cardiologue, dermatologue, pédiatre, dentiste, psychiatre, gynécologue.
    """
    key = specialty.lower().strip()
    mapped = SPECIALTY_MAP.get(key)

    if not mapped:
        return (
            f"Spécialité inconnue : '{specialty}'. "
            f"Spécialités disponibles : généraliste, cardiologue, dermatologue, "
            f"pédiatre, dentiste, psychiatre, gynécologue."
        )

    try:
        result = await call_business_service(
            "doctor-service",
            f"/api/doctors/specialty/{mapped}",
            method="GET",
        )
        return str(result)
    except Exception as e:
        return f"Erreur lors de la recherche de médecins : {e}"

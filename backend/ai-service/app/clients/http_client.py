from app.clients.eureka import call_service

# NOTE: la récupération du jeton technique via Auth-Service (get_technical_token)
# est désactivée temporairement, le temps que la sécurité soit configurée côté
# Spring Boot. À réactiver une fois Auth-Service prêt (voir version précédente
# de ce fichier / auth_client.py).


async def call_business_service(
        service_name: str, path: str, method: str = "GET", **kwargs
):
    """
    Point d'entrée unique utilisé par les Tools LangChain pour appeler
    Patient-Service / Doctor-Service / Appointment-Service.
    Résout l'instance via Eureka. Pas d'authentification pour l'instant.
    """
    return await call_service(
        service_name, path, method=method, return_type="json", **kwargs
    )
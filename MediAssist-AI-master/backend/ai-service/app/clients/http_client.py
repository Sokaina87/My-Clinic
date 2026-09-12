import logging
import requests
from app.clients.eureka import call_service

logger = logging.getLogger(__name__)

SERVICE_PORT_MAP = {
    "PATIENT-SERVICE": "http://localhost:8081",
    "DOCTOR-SERVICE": "http://localhost:8082",
    "APPOINTMENT-SERVICE": "http://localhost:8083",
    "DIAGNOSIS-SERVICE": "http://localhost:8084",
    "AUTH-SERVICE": "http://localhost:8085",
}


async def call_business_service(
    service_name: str, path: str, method: str = "GET", **kwargs
):
    """
    Point d'entrée unique utilisé par les Tools LangChain pour appeler
    Patient-Service / Doctor-Service / Appointment-Service / Diagnosis-Service.
    Résout via Eureka en priorité et bascule sur un appel HTTP direct si Eureka échoue.
    """
    norm_name = service_name.upper().strip()
    try:
        return await call_service(
            norm_name, path, method=method, return_type="json", **kwargs
        )
    except Exception as e:
        logger.warning(
            "Appel Eureka pour %s (%s) indisponible. Bascule sur HTTP direct...",
            service_name,
            e,
        )
        base_url = SERVICE_PORT_MAP.get(norm_name, "http://localhost:8080")
        url = f"{base_url}{path}"
        json_body = kwargs.get("json")
        params = kwargs.get("params")
        headers = kwargs.get("headers", {})

        response = requests.request(
            method=method,
            url=url,
            json=json_body,
            params=params,
            headers=headers,
            timeout=5.0,
        )
        if response.status_code in (200, 201):
            try:
                return response.json()
            except Exception:
                return response.text
        return {"status": response.status_code, "detail": response.text}
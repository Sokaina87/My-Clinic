import logging
import os
import socket

import py_eureka_client.eureka_client as eureka_client

from app.config import settings

logger = logging.getLogger(__name__)


def _detect_instance_ip() -> str:
    """
    Sous Docker/Linux, HOSTNAME est défini (= ID du conteneur, résolu par le DNS interne).
    En local sur Windows, HOSTNAME n'existe pas : on détecte l'IP locale réelle à la place,
    pour éviter d'envoyer instance_ip=None à Eureka (ce qui provoque un 400 au enregistrement).
    """
    hostname_env = os.environ.get("HOSTNAME")
    if hostname_env:
        return hostname_env

    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


async def register_with_eureka() -> None:
    """À appeler dans le lifespan startup de FastAPI."""
    await eureka_client.init_async(
        eureka_server=settings.eureka_server,
        app_name=settings.app_name,
        instance_port=settings.instance_port,
        instance_ip=_detect_instance_ip(),
    )
    logger.info("Ai-Service enregistré auprès d'Eureka (%s)", settings.eureka_server)


async def deregister_from_eureka() -> None:
    """À appeler dans le lifespan shutdown de FastAPI."""
    await eureka_client.stop_async()
    logger.info("Ai-Service désinscrit d'Eureka")


async def call_service(service_name: str, path: str, method: str = "GET", **kwargs):
    """
    Résout une instance via Eureka et fait l'appel HTTP.
    service_name doit correspondre au nom d'enregistrement Eureka du service cible,
    ex: "PATIENT-SERVICE".
    """
    return await eureka_client.do_service_async(
        service_name, path, method=method, **kwargs
    )
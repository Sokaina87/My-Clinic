"""A small, read-only doctor directory provided to the patient assistant."""

import asyncio

import requests
import psycopg
from psycopg.rows import dict_row

from app.config import settings

SPECIALTY_LABELS = {
    "GENERALIST": "Médecine générale",
    "CARDIOLOGIST": "Cardiologie",
    "DERMATOLOGIST": "Dermatologie",
    "PEDIATRICIAN": "Pédiatrie",
    "DENTIST": "Chirurgie dentaire",
    "PSYCHIATRIST": "Psychiatrie",
    "GYNECOLOGIST": "Gynécologie",
}

# These entries match the Doctor-Service data initializer and keep the demo usable offline.
DEMO_DOCTORS = [
    {"id": "d1e2f3a4-0000-0000-0000-000000000001", "name": "Dr Jean Dupont", "specialty": "Cardiologie", "address": "22 Avenue Hoche, Paris"},
    {"id": "d1e2f3a4-0000-0000-0000-000000000002", "name": "Dr Alice Bernard", "specialty": "Médecine générale", "address": "10 Rue Royale, Paris"},
    {"id": "d1e2f3a4-0000-0000-0000-000000000003", "name": "Dr Marc Moreau", "specialty": "Dermatologie", "address": "5 Rue de Rivoli, Paris"},
]


def _load_directory() -> list[dict]:
    response = requests.get("http://localhost:8080/api/doctors/active", timeout=2)
    response.raise_for_status()
    doctors = response.json()
    return [
        {
            "id": doctor["id"],
            "name": f"Dr {doctor['firstName']} {doctor['lastName']}",
            "specialty": SPECIALTY_LABELS.get(doctor.get("specialty"), doctor.get("specialty", "Non renseignée")),
            "address": doctor.get("address") or "Adresse non renseignée",
        }
        for doctor in doctors
    ]


def _load_directory_from_database() -> list[dict]:
    with psycopg.connect(settings.doctor_database_url, row_factory=dict_row, connect_timeout=2) as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, first_name, last_name, specialty, address FROM doctors WHERE active = TRUE ORDER BY last_name")
            return [
                {"id": str(row["id"]), "name": f"Dr {row['first_name']} {row['last_name']}", "specialty": SPECIALTY_LABELS.get(row["specialty"], row["specialty"]), "address": row["address"] or "Adresse non renseignée"}
                for row in cursor.fetchall()
            ]


async def get_doctor_directory() -> tuple[list[dict], str]:
    try:
        doctors = await asyncio.to_thread(_load_directory)
        source = "annuaire actif"
    except (requests.RequestException, ValueError, KeyError):
        try:
            doctors = await asyncio.to_thread(_load_directory_from_database)
            source = "base médecins"
        except psycopg.Error:
            doctors = DEMO_DOCTORS
            source = "annuaire de démonstration"
    return doctors, source


async def doctor_directory_context() -> str:
    doctors, source = await get_doctor_directory()
    entries = "\n".join(f"- {doctor['name']} : {doctor['specialty']} — Cabinet : {doctor['address']}" for doctor in doctors)
    return f"Médecins disponibles ({source}) :\n{entries}"

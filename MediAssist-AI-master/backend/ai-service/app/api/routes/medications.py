"""Read-only medication catalogue search for clinical reference."""

from fastapi import APIRouter, HTTPException, Query
import psycopg
from psycopg.rows import dict_row

from app.config import settings

router = APIRouter()


@router.get("/medications/search")
def search_medications(q: str = Query(min_length=2, max_length=100)) -> dict:
    """Return catalogue matches; presence does not establish clinical suitability."""
    needle = f"%{q.strip()}%"
    try:
        with psycopg.connect(
            settings.medication_database_url,
            row_factory=dict_row,
            connect_timeout=4,
        ) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT name, active_ingredient, form, strength, therapeutic_class, country_code, description
                    FROM medications
                    WHERE name ILIKE %s OR active_ingredient ILIKE %s
                    ORDER BY CASE WHEN LOWER(name) = LOWER(%s) THEN 0 ELSE 1 END, name
                    LIMIT 12
                    """,
                    (needle, needle, q.strip()),
                )
                medications = cursor.fetchall()
    except psycopg.Error as error:
        raise HTTPException(
            status_code=503,
            detail="Le catalogue des médicaments est indisponible. Vérifiez le conteneur medication-postgres.",
        ) from error

    return {
        "query": q.strip(),
        "exists": bool(medications),
        "medications": medications,
        "disclaimer": "Présence dans le catalogue de démonstration uniquement : vérifiez les sources officielles, l'indication, les contre-indications, les interactions et la posologie.",
    }

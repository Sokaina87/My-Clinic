"""Patient-confirmed appointment requests, stored as PENDING for doctor validation."""
from datetime import date, time
from uuid import uuid4

import psycopg
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from fastapi import Query

from app.config import settings

router = APIRouter()


class AppointmentRequest(BaseModel):
    patient_id: str
    doctor_id: str
    appointment_date: date
    appointment_time: time
    reason: str = Field(min_length=3, max_length=500)


@router.post("/patient/appointment-requests")
def create_request(request: AppointmentRequest) -> dict:
    try:
        with psycopg.connect(settings.appointment_database_url, connect_timeout=3) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, reason)
                       VALUES (%s,%s,%s,%s,%s,'PENDING',%s)""",
                    (str(uuid4()), request.patient_id, request.doctor_id, request.appointment_date, request.appointment_time, request.reason),
                )
            connection.commit()
        return {"status": "PENDING", "message": "Demande envoyée au médecin pour validation."}
    except psycopg.Error as error:
        raise HTTPException(status_code=503, detail="Impossible d'enregistrer la demande de rendez-vous.") from error


@router.get("/doctor/appointments")
def doctor_appointments(doctor_id: str = Query()) -> list[dict]:
    try:
        with psycopg.connect(settings.appointment_database_url, row_factory=psycopg.rows.dict_row, connect_timeout=3) as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT id, patient_id, appointment_date, appointment_time, status, reason FROM appointments WHERE doctor_id=%s ORDER BY appointment_date, appointment_time", (doctor_id,))
                return cursor.fetchall()
    except psycopg.Error as error:
        raise HTTPException(status_code=503, detail="Agenda indisponible.") from error


@router.patch("/doctor/appointments/{appointment_id}/confirm")
def confirm_appointment(appointment_id: str) -> dict:
    try:
        with psycopg.connect(settings.appointment_database_url, connect_timeout=3) as connection:
            with connection.cursor() as cursor:
                cursor.execute("UPDATE appointments SET status='CONFIRMED' WHERE id=%s RETURNING id", (appointment_id,))
                if cursor.fetchone() is None:
                    raise HTTPException(status_code=404, detail="Rendez-vous introuvable.")
            connection.commit()
        return {"status": "CONFIRMED"}
    except psycopg.Error as error:
        raise HTTPException(status_code=503, detail="Impossible de confirmer le rendez-vous.") from error

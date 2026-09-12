package org.gestionetudiant.doctor_service.exception;

import java.util.UUID;

public class DoctorNotFoundException extends RuntimeException {

    public DoctorNotFoundException(UUID id) {
        super("Médecin introuvable avec l'identifiant : " + id);
    }
}

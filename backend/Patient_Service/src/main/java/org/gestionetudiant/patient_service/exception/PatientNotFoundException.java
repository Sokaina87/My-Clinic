package org.gestionetudiant.patient_service.exception;

import java.util.UUID;

public class PatientNotFoundException extends RuntimeException {
    public PatientNotFoundException(UUID id) {
        super("Patient introuvable avec l'identifiant : " + id);
    }
}

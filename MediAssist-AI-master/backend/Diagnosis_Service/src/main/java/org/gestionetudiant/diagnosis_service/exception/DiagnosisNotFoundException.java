package org.gestionetudiant.diagnosis_service.exception;

import java.util.UUID;

public class DiagnosisNotFoundException extends RuntimeException {
    public DiagnosisNotFoundException(UUID id) {
        super("Diagnosis not found with id: " + id);
    }
}

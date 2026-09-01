package org.gestionetudiant.diagnosis_service.dto;

import org.gestionetudiant.diagnosis_service.entity.Diagnosis;
import org.gestionetudiant.diagnosis_service.entity.DiagnosisStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record DiagnosisResponse(
        UUID id,
        UUID patientId,
        UUID doctorId,
        String symptoms,
        String medicalHistory,
        String diagnosisName,
        String diagnosisCode,
        DiagnosisStatus status,
        String severity,
        String notes,
        LocalDateTime createdAt
) {
    public static DiagnosisResponse fromEntity(Diagnosis diagnosis) {
        return new DiagnosisResponse(
                diagnosis.getId(),
                diagnosis.getPatientId(),
                diagnosis.getDoctorId(),
                diagnosis.getSymptoms(),
                diagnosis.getMedicalHistory(),
                diagnosis.getDiagnosisName(),
                diagnosis.getDiagnosisCode(),
                diagnosis.getStatus(),
                diagnosis.getSeverity(),
                diagnosis.getNotes(),
                diagnosis.getCreatedAt()
        );
    }
}

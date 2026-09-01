package org.gestionetudiant.diagnosis_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record DiagnosisRequest(
        @NotNull(message = "patientId is required") UUID patientId,
        @NotNull(message = "doctorId is required") UUID doctorId,
        @NotBlank(message = "symptoms are required") String symptoms,
        String medicalHistory,
        String severity,
        String notes
) {
}

package org.gestionetudiant.diagnosis_service.service;

import org.gestionetudiant.diagnosis_service.dto.DiagnosisRequest;
import org.gestionetudiant.diagnosis_service.dto.DiagnosisResponse;

import java.util.List;
import java.util.UUID;

public interface DiagnosisService {
    DiagnosisResponse create(DiagnosisRequest request);
    DiagnosisResponse findById(UUID id);
    List<DiagnosisResponse> findAll();
    List<DiagnosisResponse> findByPatientId(UUID patientId);
    DiagnosisResponse update(UUID id, DiagnosisRequest request);
    void delete(UUID id);
}

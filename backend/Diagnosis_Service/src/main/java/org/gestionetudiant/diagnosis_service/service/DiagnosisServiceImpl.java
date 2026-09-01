package org.gestionetudiant.diagnosis_service.service;

import lombok.RequiredArgsConstructor;
import org.gestionetudiant.diagnosis_service.client.AiClient;
import org.gestionetudiant.diagnosis_service.client.PatientClient;
import org.gestionetudiant.diagnosis_service.dto.DiagnosisRequest;
import org.gestionetudiant.diagnosis_service.dto.DiagnosisResponse;
import org.gestionetudiant.diagnosis_service.entity.Diagnosis;
import org.gestionetudiant.diagnosis_service.entity.DiagnosisStatus;
import org.gestionetudiant.diagnosis_service.exception.DiagnosisNotFoundException;
import org.gestionetudiant.diagnosis_service.repository.DiagnosisRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DiagnosisServiceImpl implements DiagnosisService {

    private final DiagnosisRepository diagnosisRepository;
    private final PatientClient patientClient;
    private final AiClient aiClient;

    @Override
    public DiagnosisResponse create(DiagnosisRequest request) {
        if (!patientClient.existsById(request.patientId())) {
            throw new IllegalArgumentException("Le patient n'existe pas : " + request.patientId());
        }

        String aiDiagnosis = aiClient.requestDiagnosis(request.symptoms(), request.medicalHistory());

        Diagnosis diagnosis = Diagnosis.builder()
                .patientId(request.patientId())
                .doctorId(request.doctorId())
                .symptoms(request.symptoms())
                .medicalHistory(request.medicalHistory())
                .diagnosisName(aiDiagnosis)
                .diagnosisCode("AI-ANALYZE")
                .status(DiagnosisStatus.SUSPECTED)
                .severity(request.severity() != null && !request.severity().isBlank()
                        ? request.severity()
                        : "MEDIUM")
                .notes(request.notes())
                .build();

        Diagnosis saved = diagnosisRepository.save(diagnosis);
        return DiagnosisResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DiagnosisResponse findById(UUID id) {
        Diagnosis diagnosis = diagnosisRepository.findById(id)
                .orElseThrow(() -> new DiagnosisNotFoundException(id));
        return DiagnosisResponse.fromEntity(diagnosis);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiagnosisResponse> findAll() {
        return diagnosisRepository.findAll().stream()
                .map(DiagnosisResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiagnosisResponse> findByPatientId(UUID patientId) {
        return diagnosisRepository.findByPatientId(patientId).stream()
                .map(DiagnosisResponse::fromEntity)
                .toList();
    }

    @Override
    public DiagnosisResponse update(UUID id, DiagnosisRequest request) {
        Diagnosis diagnosis = diagnosisRepository.findById(id)
                .orElseThrow(() -> new DiagnosisNotFoundException(id));

        if (!patientClient.existsById(request.patientId())) {
            throw new IllegalArgumentException("Le patient n'existe pas : " + request.patientId());
        }

        diagnosis.setPatientId(request.patientId());
        diagnosis.setDoctorId(request.doctorId());
        diagnosis.setSymptoms(request.symptoms());
        diagnosis.setMedicalHistory(request.medicalHistory());
        diagnosis.setSeverity(request.severity() != null && !request.severity().isBlank()
                ? request.severity()
                : diagnosis.getSeverity());
        diagnosis.setNotes(request.notes());

        String aiDiagnosis = aiClient.requestDiagnosis(request.symptoms(), request.medicalHistory());
        diagnosis.setDiagnosisName(aiDiagnosis);
        diagnosis.setDiagnosisCode("AI-ANALYZE");
        diagnosis.setStatus(DiagnosisStatus.SUSPECTED);

        return DiagnosisResponse.fromEntity(diagnosisRepository.save(diagnosis));
    }

    @Override
    public void delete(UUID id) {
        Diagnosis diagnosis = diagnosisRepository.findById(id)
                .orElseThrow(() -> new DiagnosisNotFoundException(id));
        diagnosisRepository.delete(diagnosis);
    }
}

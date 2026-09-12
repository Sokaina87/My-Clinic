package org.gestionetudiant.diagnosis_service.repository;

import org.gestionetudiant.diagnosis_service.entity.Diagnosis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DiagnosisRepository extends JpaRepository<Diagnosis, UUID> {
    List<Diagnosis> findByPatientId(UUID patientId);
    List<Diagnosis> findByDoctorId(UUID doctorId);
}

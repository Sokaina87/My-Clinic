package org.gestionetudiant.patient_service.repository;

import org.gestionetudiant.patient_service.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PatientRepository extends JpaRepository<Patient, UUID> {
    Optional<Patient> findByEmail(String email);
    boolean existsByEmail(String email);
}

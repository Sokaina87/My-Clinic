package org.gestionetudiant.patient_service.service;


import org.gestionetudiant.patient_service.entity.Patient;

import java.util.List;
import java.util.UUID;

public interface PatientService {
    Patient create(Patient patient);
    Patient findById(UUID id);
    List<Patient> findAll();
    Patient update(UUID id, Patient patient);
    void delete(UUID id);
    boolean existsById(UUID id);
}

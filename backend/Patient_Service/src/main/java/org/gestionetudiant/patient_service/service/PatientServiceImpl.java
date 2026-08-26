package org.gestionetudiant.patient_service.service;

import org.gestionetudiant.patient_service.entity.Patient;
import lombok.RequiredArgsConstructor;
import org.gestionetudiant.patient_service.exception.PatientNotFoundException;
import org.gestionetudiant.patient_service.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientServiceImpl implements PatientService{

    private final PatientRepository patientRepository;

    @Override
    public Patient create(Patient patient) {
        return patientRepository.save(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public Patient findById(UUID id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    @Override
    public Patient update(UUID id, Patient patientData) {
        Patient patient = findById(id);

        patient.setFirstName(patientData.getFirstName());
        patient.setLastName(patientData.getLastName());
        patient.setEmail(patientData.getEmail());
        patient.setPhone(patientData.getPhone());
        patient.setBirthDate(patientData.getBirthDate());
        patient.setGender(patientData.getGender());
        patient.setAddress(patientData.getAddress());
        patient.setEmergencyContact(patientData.getEmergencyContact());

        return patientRepository.save(patient);
    }

    @Override
    public void delete(UUID id) {
        Patient patient = findById(id);
        patientRepository.delete(patient);
    }

    @Override
    public boolean existsById(UUID id) {
        return patientRepository.existsById(id);
    }

}

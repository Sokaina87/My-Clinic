package org.gestionetudiant.doctor_service.service;

import lombok.RequiredArgsConstructor;
import org.gestionetudiant.doctor_service.entity.Doctor;
import org.gestionetudiant.doctor_service.entity.Specialty;
import org.gestionetudiant.doctor_service.exception.DoctorNotFoundException;
import org.gestionetudiant.doctor_service.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;

    @Override
    public Doctor create(Doctor doctor) {
        doctor.setActive(true);
        return doctorRepository.save(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public Doctor findById(UUID id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new DoctorNotFoundException(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Doctor> findAll() {
        return doctorRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Doctor> findBySpecialty(Specialty specialty) {
        return doctorRepository.findBySpecialty(specialty);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Doctor> findActiveDoctors() {
        return doctorRepository.findByActiveTrue();
    }

    @Override
    public Doctor update(UUID id, Doctor doctorData) {
        Doctor doctor = findById(id);

        doctor.setFirstName(doctorData.getFirstName());
        doctor.setLastName(doctorData.getLastName());
        doctor.setEmail(doctorData.getEmail());
        doctor.setPhone(doctorData.getPhone());
        doctor.setSpecialty(doctorData.getSpecialty());
        doctor.setAddress(doctorData.getAddress());
        doctor.setExperienceYears(doctorData.getExperienceYears());
        doctor.setActive(doctorData.isActive());

        return doctorRepository.save(doctor);
    }

    @Override
    public void delete(UUID id) {
        Doctor doctor = findById(id);
        doctorRepository.delete(doctor);
    }
    @Override
    public boolean isAvailable(UUID id) {
        return doctorRepository.findById(id)
                .map(Doctor::isActive)
                .orElse(false);
    }

}
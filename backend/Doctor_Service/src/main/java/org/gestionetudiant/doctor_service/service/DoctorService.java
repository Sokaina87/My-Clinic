package org.gestionetudiant.doctor_service.service;



import org.gestionetudiant.doctor_service.entity.Doctor;
import org.gestionetudiant.doctor_service.entity.Specialty;

import java.util.List;
import java.util.UUID;

public interface DoctorService {

    Doctor create(Doctor doctor);

    Doctor findById(UUID id);

    List<Doctor> findAll();

    List<Doctor> findBySpecialty(Specialty specialty);

    List<Doctor> findActiveDoctors();

    Doctor update(UUID id, Doctor doctor);

    void delete(UUID id);

    boolean isAvailable(UUID id);


}

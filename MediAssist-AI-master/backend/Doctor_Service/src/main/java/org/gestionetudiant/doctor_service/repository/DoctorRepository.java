package org.gestionetudiant.doctor_service.repository;

import org.gestionetudiant.doctor_service.entity.Doctor;
import org.gestionetudiant.doctor_service.entity.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

    List<Doctor> findBySpecialty(Specialty specialty);

    List<Doctor> findByActiveTrue();

}

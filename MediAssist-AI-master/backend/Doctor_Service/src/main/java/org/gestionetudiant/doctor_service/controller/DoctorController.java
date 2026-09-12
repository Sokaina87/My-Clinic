package org.gestionetudiant.doctor_service.controller;

import lombok.RequiredArgsConstructor;
import org.gestionetudiant.doctor_service.entity.Doctor;
import org.gestionetudiant.doctor_service.entity.Specialty;
import org.gestionetudiant.doctor_service.service.DoctorService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctors" )
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Doctor create(@RequestBody Doctor doctor) {
        return doctorService.create(doctor);
    }

    @GetMapping
    public List<Doctor> findAll() {
        return doctorService.findAll();
    }

    @GetMapping("/{id}")
    public Doctor findById(@PathVariable UUID id) {
        return doctorService.findById(id);
    }

    @GetMapping("/specialty/{specialty}")
    public List<Doctor> findBySpecialty(
            @PathVariable Specialty specialty) {
        return doctorService.findBySpecialty(specialty);
    }

    @GetMapping("/active")
    public List<Doctor> findActiveDoctors() {
        return doctorService.findActiveDoctors();
    }

    @PutMapping("/{id}")
    public Doctor update(
            @PathVariable UUID id,
            @RequestBody Doctor doctor) {
        return doctorService.update(id, doctor);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        doctorService.delete(id);
    }

    @GetMapping("/{id}/available")
    public boolean isAvailable(@PathVariable UUID id) {
        return doctorService.isAvailable(id);
    }

}
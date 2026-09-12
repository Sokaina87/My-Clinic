package org.gestionetudiant.patient_service.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.gestionetudiant.patient_service.entity.Patient;
import org.gestionetudiant.patient_service.service.PatientService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Patient create(@Valid @RequestBody Patient patient) {
        return patientService.create(patient);
    }

    @GetMapping("/{id}")
    public Patient findById(@PathVariable UUID id) {
        return patientService.findById(id);
    }

    @GetMapping
    public List<Patient> findAll() {
        return patientService.findAll();
    }

    @PutMapping("/{id}")
    public Patient update(
            @PathVariable UUID id,
            @Valid @RequestBody Patient patient) {
        return patientService.update(id, patient);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        patientService.delete(id);
    }

    @GetMapping("/{id}/exists")
    public boolean existsById(@PathVariable UUID id) {
        return patientService.existsById(id);
    }

}

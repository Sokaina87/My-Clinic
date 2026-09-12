package org.gestionetudiant.diagnosis_service.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.gestionetudiant.diagnosis_service.dto.DiagnosisRequest;
import org.gestionetudiant.diagnosis_service.dto.DiagnosisResponse;
import org.gestionetudiant.diagnosis_service.service.DiagnosisService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/diagnoses")
@RequiredArgsConstructor
public class DiagnosisController {

    private final DiagnosisService diagnosisService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DiagnosisResponse create(@Valid @RequestBody DiagnosisRequest request) {
        return diagnosisService.create(request);
    }

    @GetMapping
    public List<DiagnosisResponse> findAll() {
        return diagnosisService.findAll();
    }

    @GetMapping("/{id}")
    public DiagnosisResponse findById(@PathVariable UUID id) {
        return diagnosisService.findById(id);
    }

    @GetMapping("/patient/{patientId}")
    public List<DiagnosisResponse> findByPatientId(@PathVariable UUID patientId) {
        return diagnosisService.findByPatientId(patientId);
    }

    @PutMapping("/{id}")
    public DiagnosisResponse update(@PathVariable UUID id, @Valid @RequestBody DiagnosisRequest request) {
        return diagnosisService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        diagnosisService.delete(id);
    }
}

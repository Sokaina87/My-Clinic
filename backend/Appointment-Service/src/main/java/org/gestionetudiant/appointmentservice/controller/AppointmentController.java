package org.gestionetudiant.appointmentservice.controller;


import lombok.RequiredArgsConstructor;
import org.gestionetudiant.appointmentservice.entity.Appointment;
import org.gestionetudiant.appointmentservice.service.AppointmentService;
import org.gestionetudiant.appointmentservice.entity.AppointmentStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments" )
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Appointment create(@RequestBody Appointment appointment) {
        return appointmentService.create(appointment);
    }

    @GetMapping
    public List<Appointment> findAll() {
        return appointmentService.findAll();
    }

    @GetMapping("/{id}")
    public Appointment findById(@PathVariable UUID id) {
        return appointmentService.findById(id);
    }

    @GetMapping("/patient/{patientId}")
    public List<Appointment> findByPatientId(
            @PathVariable UUID patientId) {
        return appointmentService.findByPatientId(patientId);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Appointment> findByDoctorId(
            @PathVariable UUID doctorId) {
        return appointmentService.findByDoctorId(doctorId);
    }

    @GetMapping("/date/{date}")
    public List<Appointment> findByDate(
            @PathVariable LocalDate date) {
        return appointmentService.findByDate(date);
    }

    @PatchMapping("/{id}/status")
    public Appointment updateStatus(
            @PathVariable UUID id,
            @RequestParam AppointmentStatus status) {
        return appointmentService.updateStatus(id, status);
    }

    @PutMapping("/{id}")
    public Appointment update(
            @PathVariable UUID id,
            @RequestBody Appointment appointment) {
        return appointmentService.update(id, appointment);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        appointmentService.delete(id);
    }
}

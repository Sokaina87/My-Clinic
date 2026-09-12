package org.gestionetudiant.appointmentservice.service;


import org.gestionetudiant.appointmentservice.entity.Appointment;
import org.gestionetudiant.appointmentservice.entity.AppointmentStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AppointmentService {

    Appointment create(Appointment appointment);

    Appointment findById(UUID id);

    List<Appointment> findAll();

    List<Appointment> findByPatientId(UUID patientId);

    List<Appointment> findByDoctorId(UUID doctorId);

    List<Appointment> findByDate(LocalDate date);

    Appointment updateStatus(UUID id, AppointmentStatus status);

    Appointment update(UUID id, Appointment appointment);

    void delete(UUID id);
}

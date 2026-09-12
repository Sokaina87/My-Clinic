package org.gestionetudiant.appointmentservice.service;

import lombok.RequiredArgsConstructor;
import org.gestionetudiant.appointmentservice.client.DoctorClient;
import org.gestionetudiant.appointmentservice.client.PatientClient;
import org.gestionetudiant.appointmentservice.entity.Appointment;
import org.gestionetudiant.appointmentservice.entity.AppointmentStatus;
import org.gestionetudiant.appointmentservice.exception.AppointmentNotFoundException;
import org.gestionetudiant.appointmentservice.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientClient patientClient;
    private final DoctorClient doctorClient;

    @Override
    public Appointment create(Appointment appointment) {
        boolean patientExists = patientClient
                .existsById(appointment.getPatientId());

        if (!patientExists) {
            throw new IllegalArgumentException(
                    "Le patient n'existe pas : "
                            + appointment.getPatientId()
            );
        }
        boolean doctorAvailable = doctorClient
                .isAvailable(appointment.getDoctorId());

        if (!doctorAvailable) {
            throw new IllegalArgumentException(
                    "Le médecin n'existe pas ou n'est pas actif : "
                            + appointment.getDoctorId()
            );
        }

        // Vérifier que le créneau est libre
        boolean alreadyReserved = appointmentRepository
                .existsByDoctorIdAndAppointmentDateAndAppointmentTime(
                        appointment.getDoctorId(),
                        appointment.getAppointmentDate(),
                        appointment.getAppointmentTime()
                );

        if (alreadyReserved) {
            throw new IllegalStateException(
                    "Ce médecin possède déjà un rendez-vous à cette date et cette heure."
            );
        }

        appointment.setStatus(AppointmentStatus.PENDING);
        return appointmentRepository.save(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public Appointment findById(UUID id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> findAll() {
        return appointmentRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> findByPatientId(UUID patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> findByDoctorId(UUID doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> findByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDate(date);
    }

    @Override
    public Appointment updateStatus(UUID id, AppointmentStatus status) {
        Appointment appointment = findById(id);
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    @Override
    public Appointment update(UUID id, Appointment appointmentData) {
        Appointment appointment = findById(id);

        appointment.setPatientId(appointmentData.getPatientId());
        appointment.setDoctorId(appointmentData.getDoctorId());
        appointment.setAppointmentDate(appointmentData.getAppointmentDate());
        appointment.setAppointmentTime(appointmentData.getAppointmentTime());
        appointment.setReason(appointmentData.getReason());
        appointment.setNotes(appointmentData.getNotes());

        return appointmentRepository.save(appointment);
    }

    @Override
    public void delete(UUID id) {
        Appointment appointment = findById(id);
        appointmentRepository.delete(appointment);
    }
}

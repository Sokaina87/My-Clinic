package org.gestionetudiant.appointmentservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.gestionetudiant.appointmentservice.entity.Appointment;
import org.gestionetudiant.appointmentservice.entity.AppointmentStatus;
import org.gestionetudiant.appointmentservice.repository.AppointmentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final AppointmentRepository appointmentRepository;

    private static final UUID SOFIA_ID = UUID.fromString("a1b2c3d4-0000-0000-0000-000000000001");
    private static final UUID THOMAS_ID = UUID.fromString("a1b2c3d4-0000-0000-0000-000000000002");
    private static final UUID DR_DUPONT_ID = UUID.fromString("d1e2f3a4-0000-0000-0000-000000000001");
    private static final UUID DR_BERNARD_ID = UUID.fromString("d1e2f3a4-0000-0000-0000-000000000002");

    @Override
    public void run(String... args) {
        if (appointmentRepository.count() == 0) {
            log.info("Initialisation des rendez-vous dans Appointment-Service...");

            appointmentRepository.save(Appointment.builder()
                    .patientId(SOFIA_ID)
                    .doctorId(DR_DUPONT_ID)
                    .appointmentDate(LocalDate.of(2026, 9, 15))
                    .appointmentTime(LocalTime.of(10, 0))
                    .status(AppointmentStatus.CONFIRMED)
                    .reason("Consultation de suivi cardiologique")
                    .notes("Vérification de la tension artérielle et électrocardiogramme")
                    .build());

            appointmentRepository.save(Appointment.builder()
                    .patientId(SOFIA_ID)
                    .doctorId(DR_BERNARD_ID)
                    .appointmentDate(LocalDate.of(2026, 9, 22))
                    .appointmentTime(LocalTime.of(14, 30))
                    .status(AppointmentStatus.CONFIRMED)
                    .reason("Bilan de santé annuel")
                    .notes("Prise de sang et contrôle général")
                    .build());

            appointmentRepository.save(Appointment.builder()
                    .patientId(THOMAS_ID)
                    .doctorId(DR_DUPONT_ID)
                    .appointmentDate(LocalDate.of(2026, 9, 18))
                    .appointmentTime(LocalTime.of(11, 0))
                    .status(AppointmentStatus.PENDING)
                    .reason("Contrôle tensionnel")
                    .notes("Suivi mensuel")
                    .build());

            log.info("Rendez-vous de test créés avec succès !");
        }
    }
}

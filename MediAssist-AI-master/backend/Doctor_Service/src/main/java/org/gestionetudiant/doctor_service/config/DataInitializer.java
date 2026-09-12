package org.gestionetudiant.doctor_service.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.gestionetudiant.doctor_service.entity.Doctor;
import org.gestionetudiant.doctor_service.entity.Specialty;
import org.gestionetudiant.doctor_service.repository.DoctorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final DoctorRepository doctorRepository;

    public static final UUID DR_DUPONT_ID = UUID.fromString("d1e2f3a4-0000-0000-0000-000000000001");
    public static final UUID DR_BERNARD_ID = UUID.fromString("d1e2f3a4-0000-0000-0000-000000000002");
    public static final UUID DR_MOREAU_ID = UUID.fromString("d1e2f3a4-0000-0000-0000-000000000003");

    @Override
    public void run(String... args) {
        if (doctorRepository.count() == 0) {
            log.info("Initialisation des médecins dans Doctor_Service...");

            doctorRepository.save(Doctor.builder()
                    .id(DR_DUPONT_ID)
                    .firstName("Jean")
                    .lastName("Dupont")
                    .email("jean.dupont@mediassist.local")
                    .phone("+33140506070")
                    .specialty(Specialty.CARDIOLOGIST)
                    .address("22 Avenue Hoche, Paris")
                    .experienceYears(15)
                    .active(true)
                    .build());

            doctorRepository.save(Doctor.builder()
                    .id(DR_BERNARD_ID)
                    .firstName("Alice")
                    .lastName("Bernard")
                    .email("alice.bernard@mediassist.local")
                    .phone("+33140506071")
                    .specialty(Specialty.GENERALIST)
                    .address("10 Rue Royale, Paris")
                    .experienceYears(10)
                    .active(true)
                    .build());

            doctorRepository.save(Doctor.builder()
                    .id(DR_MOREAU_ID)
                    .firstName("Marc")
                    .lastName("Moreau")
                    .email("marc.moreau@mediassist.local")
                    .phone("+33140506072")
                    .specialty(Specialty.DERMATOLOGIST)
                    .address("5 Rue de Rivoli, Paris")
                    .experienceYears(8)
                    .active(true)
                    .build());

            log.info("3 médecins créés avec succès !");
        }
    }
}

package org.gestionetudiant.patient_service.config;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.gestionetudiant.patient_service.entity.Gender;
import org.gestionetudiant.patient_service.entity.Patient;
import org.gestionetudiant.patient_service.repository.PatientRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final PatientRepository patientRepository;
    private final EntityManager entityManager;

    public static final UUID SOFIA_ID = UUID.fromString("a1b2c3d4-0000-0000-0000-000000000001");
    public static final UUID THOMAS_ID = UUID.fromString("a1b2c3d4-0000-0000-0000-000000000002");
    public static final UUID MARIE_ID = UUID.fromString("a1b2c3d4-0000-0000-0000-000000000003");

    @Override
    @Transactional
    public void run(String... args) {
        if (patientRepository.count() == 0) {
            log.info("Initialisation des données de test dans Patient_Service...");
            
            entityManager.persist(Patient.builder()
                    .id(SOFIA_ID)
                    .firstName("Sofia")
                    .lastName("Martin")
                    .email("sofia.martin@example.com")
                    .phone("+33612345678")
                    .birthDate(LocalDate.of(1992, 5, 15))
                    .gender(Gender.FEMALE)
                    .address("15 Rue de la Paix, Paris")
                    .emergencyContact("Pierre Martin (+33611223344)")
                    .build());

            entityManager.persist(Patient.builder()
                    .id(THOMAS_ID)
                    .firstName("Thomas")
                    .lastName("Dubois")
                    .email("thomas.dubois@example.com")
                    .phone("+33687654321")
                    .birthDate(LocalDate.of(1985, 11, 20))
                    .gender(Gender.MALE)
                    .address("8 Avenue Victor Hugo, Lyon")
                    .emergencyContact("Julie Dubois (+33655443322)")
                    .build());

            entityManager.persist(Patient.builder()
                    .id(MARIE_ID)
                    .firstName("Marie")
                    .lastName("Curie")
                    .email("marie.curie@example.com")
                    .phone("+33699887766")
                    .birthDate(LocalDate.of(1990, 1, 10))
                    .gender(Gender.FEMALE)
                    .address("4 Boulevard Saint-Germain, Paris")
                    .emergencyContact("Paul Curie (+33677889900)")
                    .build());

            log.info("3 patients créés avec succès !");
        }
    }
}

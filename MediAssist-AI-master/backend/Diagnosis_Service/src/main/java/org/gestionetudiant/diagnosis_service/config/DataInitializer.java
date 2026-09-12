package org.gestionetudiant.diagnosis_service.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.gestionetudiant.diagnosis_service.entity.Diagnosis;
import org.gestionetudiant.diagnosis_service.entity.DiagnosisStatus;
import org.gestionetudiant.diagnosis_service.repository.DiagnosisRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final DiagnosisRepository diagnosisRepository;

    private static final UUID SOFIA_ID = UUID.fromString("a1b2c3d4-0000-0000-0000-000000000001");
    private static final UUID DR_DUPONT_ID = UUID.fromString("d1e2f3a4-0000-0000-0000-000000000001");

    @Override
    public void run(String... args) {
        if (diagnosisRepository.count() == 0) {
            log.info("Initialisation des diagnostics dans Diagnosis_Service...");

            diagnosisRepository.save(Diagnosis.builder()
                    .patientId(SOFIA_ID)
                    .doctorId(DR_DUPONT_ID)
                    .symptoms("Céphalées modérées, fatigue passagère")
                    .medicalHistory("Hypertension artérielle légère")
                    .diagnosisName("Hypertension essentielle contrôlée")
                    .diagnosisCode("I10")
                    .status(DiagnosisStatus.CONFIRMED)
                    .severity("MODERATE")
                    .notes("Pression artérielle à 135/85 mmHg. Traitement bien toléré.")
                    .build());

            log.info("Diagnostics de test créés avec succès !");
        }
    }
}

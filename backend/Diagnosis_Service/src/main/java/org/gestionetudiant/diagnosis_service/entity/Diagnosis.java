package org.gestionetudiant.diagnosis_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "diagnoses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Diagnosis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID patientId;

    @Column(nullable = false)
    private UUID doctorId;

    @Column(nullable = false, length = 2000)
    private String symptoms;

    @Column(length = 2000)
    private String medicalHistory;

    @Column(length = 500)
    private String diagnosisName;

    @Column(length = 100)
    private String diagnosisCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiagnosisStatus status;

    @Column(length = 100)
    private String severity;

    @Column(length = 2000)
    private String notes;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}

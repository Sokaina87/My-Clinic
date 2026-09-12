package org.gestionetudiant.authservice.config;

import org.gestionetudiant.authservice.account.Account;
import org.gestionetudiant.authservice.account.AccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

/** Crée le compte administrateur local une seule fois, au démarrage. */
@Configuration
public class AdminAccountInitializer {
    @Bean
    ApplicationRunner createAdminAccount(
            AccountRepository accounts,
            PasswordEncoder passwords,
            @Value("${mediassist.admin.email:admin@mediassist.local}") String email,
            @Value("${mediassist.admin.password:Admin123!}") String password) {
        return args -> {
            if (accounts.findByEmailIgnoreCase(email).isEmpty()) {
                Account admin = new Account();
                admin.setFirstName("Administrateur");
                admin.setLastName("MediAssist");
                admin.setEmail(email.trim().toLowerCase());
                admin.setPasswordHash(passwords.encode(password));
                admin.setRole("ADMIN");
                accounts.save(admin);
            }

            List<String[]> demoPatients = List.of(
                    new String[]{"Sofia", "Martin", "sofia.martin@example.com", "SofiaTest2026!"},
                    new String[]{"Thomas", "Dubois", "thomas.dubois@example.com", "ThomasTest2026!"},
                    new String[]{"Marie", "Curie", "marie.curie@example.com", "MarieTest2026!"}
            );
            for (String[] profile : demoPatients) {
                if (accounts.findByEmailIgnoreCase(profile[2]).isPresent()) continue;
                Account patient = new Account();
                patient.setFirstName(profile[0]);
                patient.setLastName(profile[1]);
                patient.setEmail(profile[2]);
                patient.setPasswordHash(passwords.encode(profile[3]));
                patient.setRole("PATIENT");
                accounts.save(patient);
            }
            if (accounts.findByEmailIgnoreCase("jean.dupont@mediassist.local").isEmpty()) {
                Account doctor = new Account();
                doctor.setFirstName("Jean");
                doctor.setLastName("Dupont");
                doctor.setEmail("jean.dupont@mediassist.local");
                doctor.setPasswordHash(passwords.encode("DoctorTest2026!"));
                doctor.setRole("DOCTOR");
                accounts.save(doctor);
            }
        };
    }
}

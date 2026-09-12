package org.gestionetudiant.authservice.config;

import org.gestionetudiant.authservice.account.Account;
import org.gestionetudiant.authservice.account.AccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

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
            if (accounts.findByEmailIgnoreCase(email).isPresent()) return;

            Account admin = new Account();
            admin.setFirstName("Administrateur");
            admin.setLastName("MediAssist");
            admin.setEmail(email.trim().toLowerCase());
            admin.setPasswordHash(passwords.encode(password));
            admin.setRole("ADMIN");
            accounts.save(admin);
        };
    }
}

package org.gestionetudiant.authservice.account;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "accounts")
public class Account {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false) private String firstName;
    @Column(nullable = false) private String lastName;
    @Column(nullable = false, unique = true) private String email;
    @Column(nullable = false) private String passwordHash;
    @Column(nullable = false) private String role = "PATIENT";
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
    public UUID getId(){ return id; } public String getFirstName(){ return firstName; } public String getLastName(){ return lastName; }
    public String getEmail(){ return email; } public String getPasswordHash(){ return passwordHash; } public String getRole(){ return role; }
    public void setFirstName(String value){ firstName=value; } public void setLastName(String value){ lastName=value; }
    public void setEmail(String value){ email=value; } public void setPasswordHash(String value){ passwordHash=value; }
    public void setRole(String value){ role=value; }
}

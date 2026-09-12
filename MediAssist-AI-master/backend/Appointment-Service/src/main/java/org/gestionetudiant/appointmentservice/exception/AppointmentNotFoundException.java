package org.gestionetudiant.appointmentservice.exception;

import java.util.UUID;

public class AppointmentNotFoundException extends RuntimeException {

    public AppointmentNotFoundException(UUID id) {
        super("Rendez-vous introuvable avec l'identifiant : " + id);
    }
}

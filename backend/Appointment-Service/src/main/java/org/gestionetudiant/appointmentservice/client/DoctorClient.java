package org.gestionetudiant.appointmentservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "doctor-service", url = "${services.doctor.url:http://localhost:8082}")
public interface DoctorClient {

    @GetMapping("/api/doctors/{id}/available")
    boolean isAvailable(@PathVariable("id") UUID id);
}

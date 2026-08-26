package org.gestionetudiant.appointmentservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient( name = "patient-service" ,url = "localhost:8081")
public interface PatientClient {

    @GetMapping("/api/patients/{id}/exists")
    boolean existsById(@PathVariable("id") UUID id);
}

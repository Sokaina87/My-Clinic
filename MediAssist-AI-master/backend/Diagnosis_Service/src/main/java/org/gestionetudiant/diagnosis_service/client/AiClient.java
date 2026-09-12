package org.gestionetudiant.diagnosis_service.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class AiClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public AiClient(@Value("${ai.service.url:http://localhost:8000}") String baseUrl) {
        this.baseUrl = baseUrl;
        this.restTemplate = new RestTemplate();
    }

    public String requestDiagnosis(String symptoms, String medicalHistory) {
        String prompt = "Diagnose the patient using the following information. "
                + "Symptoms: " + symptoms + ". "
                + (medicalHistory != null && !medicalHistory.isBlank()
                    ? "Medical history: " + medicalHistory + ". "
                    : "")
                + "Return a concise medical assessment in one sentence.";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> payload = Map.of("message", prompt);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    baseUrl + "/agent/ask",
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            if (response.getBody() != null && response.getBody().containsKey("reply")) {
                return String.valueOf(response.getBody().get("reply"));
            }
        } catch (Exception exception) {
            return "Diagnostic non disponible pour le moment. Veuillez réessayer plus tard.";
        }

        return "Diagnostic non disponible pour le moment. Veuillez réessayer plus tard.";
    }
}

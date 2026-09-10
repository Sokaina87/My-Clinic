package org.gestionetudiant.authservice.auth;
import java.util.Map;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
@RestControllerAdvice public class ApiExceptionHandler {
 @ExceptionHandler(IllegalArgumentException.class)
 ResponseEntity<Map<String,String>> badRequest(IllegalArgumentException error){return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message",error.getMessage()));}
}

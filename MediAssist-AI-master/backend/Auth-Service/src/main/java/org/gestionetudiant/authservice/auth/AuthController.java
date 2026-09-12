package org.gestionetudiant.authservice.auth;
import jakarta.validation.Valid;
import org.gestionetudiant.authservice.account.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {
    private final AccountRepository accounts; private final PasswordEncoder passwords;
    public AuthController(AccountRepository accounts, PasswordEncoder passwords){this.accounts=accounts;this.passwords=passwords;}
    @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request){
        String email=request.email().trim().toLowerCase();
        if(accounts.findByEmailIgnoreCase(email).isPresent()) throw new IllegalArgumentException("Un compte existe déjà pour cette adresse e-mail.");
        Account account=new Account(); account.setFirstName(request.firstName().trim()); account.setLastName(request.lastName().trim()); account.setEmail(email); account.setPasswordHash(passwords.encode(request.password())); accounts.save(account);
        return response(account,"Compte patient créé. Vous pouvez maintenant vous connecter.");
    }
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request){
        Account account=accounts.findByEmailIgnoreCase(request.email().trim()).filter(a->passwords.matches(request.password(),a.getPasswordHash())).orElseThrow(()->new IllegalArgumentException("Adresse e-mail ou mot de passe incorrect."));
        return response(account,"Connexion validée.");
    }
    private AuthResponse response(Account a,String message){return new AuthResponse(a.getId(),a.getFirstName(),a.getLastName(),a.getEmail(),a.getRole(),message);}
}

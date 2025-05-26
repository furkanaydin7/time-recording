package ch.fhnw.timerecordingbackend.controller;

import ch.fhnw.timerecordingbackend.dto.authentication.ChangePasswordRequest;
import ch.fhnw.timerecordingbackend.dto.authentication.ResetPasswordRequest;
import ch.fhnw.timerecordingbackend.model.Role;
import ch.fhnw.timerecordingbackend.model.User;
import ch.fhnw.timerecordingbackend.model.enums.UserStatus;
import ch.fhnw.timerecordingbackend.repository.RoleRepository;
import ch.fhnw.timerecordingbackend.repository.UserRepository;
import ch.fhnw.timerecordingbackend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

/**
 * REST Controller für Benutzer
 * @author FA
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Neuen Benutzer erstellen (nur für ADMIN)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("🔍 CreateUser Request erhalten: " + request);

            String email = (String) request.get("email");

            // Prüfen, ob E-Mail bereits existiert
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("error", "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits"));
            }

            // Rolle suchen
            String roleName = (String) request.get("role");
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException("Rolle '" + roleName + "' nicht gefunden"));

            // Neuen Benutzer erstellen
            User user = new User();
            user.setFirstName((String) request.get("firstName"));
            user.setLastName((String) request.get("lastName"));
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode((String) request.get("password")));
            user.setPlannedHoursPerDay(((Number) request.getOrDefault("plannedHoursPerDay", 8.0)).doubleValue());
            user.setActive(true);
            user.setStatus(UserStatus.ACTIVE);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            user.setRoles(Set.of(role));

            User savedUser = userRepository.save(user);

            System.out.println("✅ Benutzer erfolgreich erstellt: " + savedUser.getEmail());

            return ResponseEntity.ok(Map.of(
                    "id", savedUser.getId(),
                    "firstName", savedUser.getFirstName(),
                    "lastName", savedUser.getLastName(),
                    "email", savedUser.getEmail(),
                    "role", roleName,
                    "active", savedUser.isActive(),
                    "message", "Benutzer erfolgreich erstellt"
            ));

        } catch (Exception e) {
            System.err.println("❌ Fehler beim Erstellen des Benutzers: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity
                    .status(500)
                    .body(Map.of("error", "Serverfehler: " + e.getMessage()));
        }
    }

    /**
     * Alle Benutzer abrufen (nur für ADMIN)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            var users = userRepository.findAll();
            System.out.println("📋 " + users.size() + " Benutzer gefunden");
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("❌ Fehler beim Abrufen der Benutzer: " + e.getMessage());
            return ResponseEntity
                    .status(500)
                    .body(Map.of("error", "Fehler beim Abrufen der Benutzer"));
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok().body(
                java.util.Map.of("message", "Passwort geändert")
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String email = request.getEmail();
        userService.sendPasswordResetLink(email);
        return ResponseEntity.ok().body(
                java.util.Map.of(
                        "message", "Reset-Link gesendet"));
    }
}
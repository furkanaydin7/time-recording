package ch.fhnw.timerecordingbackend.controller;

import ch.fhnw.timerecordingbackend.dto.admin.UserRegistrationRequest;
import ch.fhnw.timerecordingbackend.dto.admin.UserResponse;
import ch.fhnw.timerecordingbackend.model.User;
import ch.fhnw.timerecordingbackend.model.enums.UserStatus;
import ch.fhnw.timerecordingbackend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * REST Controller für Administratoren
 * API Endpunkte für Vewaltung von Benutzern
 * @author PD
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.2 - ADMIN Authority bearbeitet
 */
@RestController
@RequestMapping("/api/admin")
// Quelle: https://docs-spring-io.translate.goog/spring-security/reference/servlet/authorization/method-security.html?_x_tr_sl=en&_x_tr_tl=de&_x_tr_hl=de&_x_tr_pto=sge#use-preauthorize
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Konstruktor für AdminController
     * @param userService
     */
    @Autowired
    public AdminController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Gibt eine Liste aller UserResponse-DTOs zurück
     * @return ResponseEntity mit Liste aller UserResponse-DTOs
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        List<User> users = userService.findAllUsers();
        List<UserResponse> responses = users.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    /**
     * Gibt ein UserResponse-DTO zurück, wenn ein User mit der übergebenen ID existiert
     * @param id
     * @return ResponseEntity mit UserResponse-DTO oder ResponseEntity.notFound() wenn kein User mit der übergebenen ID existiert
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(this::convertToUserResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Erstellt einen neuen User mit den übergebenen Daten
     * @param request
     * @return ResponseEntity mit dem neu erstellten UserResponse-DTO
     */
    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRegistrationRequest request) {
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPlannedHoursPerDay(request.getPlannedHoursPerDay());

        // Hier das Passwort verschlüsseln
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User createdUser = userService.createUser(user, request.getRole());

        return new ResponseEntity<>(convertToUserResponse(createdUser), HttpStatus.CREATED);
    }

    /**
     * Aktualisiert einen bestehenden User mit den übergebenen Daten
     * @param id
     * @param request
     * @return ResponseEntity mit dem aktualisierten UserResponse-DTO
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UserRegistrationRequest request) {
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPlannedHoursPerDay(request.getPlannedHoursPerDay());

        User updatedUser = userService.updateUser(id, user);

        return ResponseEntity.ok(convertToUserResponse(updatedUser));
    }

    /**
     * Deaktiviert einen bestehenden User
     * @param id
     * @return ResponseEntity mit dem deaktivierten UserResponse-DTO
     */
    @PatchMapping("/user/{id}/deactivate")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable Long id) {
        User deactivatedUser = userService.deactivateUser(id);
        return ResponseEntity.ok(convertToUserResponse(deactivatedUser));
    }

    /**
     * Aktiviert einen bestehenden User
     * @param id
     * @return ResponseEntity mit dem aktivierten UserResponse-DTO
     */
    @DeleteMapping("/users/{id}/activate")
    public ResponseEntity<UserResponse> activateUser(@PathVariable Long id) {
        User activatedUser = userService.activateUser(id);
        return ResponseEntity.ok(convertToUserResponse(activatedUser));
    }

    /**
     * Ändert den Status eines bestehenden Users
     * @param id
     * @param status
     * @return ResponseEntity mit dem aktualisierten UserResponse-DTO
     */
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<UserResponse> changeUserStatus(@PathVariable Long id, @RequestParam UserStatus status) {
        User updatedUser = userService.updateUserStatus(id, status);
        return ResponseEntity.ok(convertToUserResponse(updatedUser));
    }

    /**
     * Fügt dem bestehenden User eine Rolle hinzu
     * @param id
     * @param roleName
     * @return ResponseEntity mit dem aktualisierten UserResponse-DTO
     */
    @PostMapping("/users/{id}/roles")
    public ResponseEntity<UserResponse> addRoleToUser(@PathVariable Long id, @RequestParam String roleName) {
        User updatedUser = userService.addRoleToUser(id, roleName);
        return ResponseEntity.ok(convertToUserResponse(updatedUser));
    }

    /**
     * Entfernt eine Rolle aus dem bestehenden User
     * @param id
     * @param roleName
     * @return ResponseEntity mit dem aktualisierten UserResponse-DTO
     */
    @DeleteMapping("/users/{id}/roles")
    public ResponseEntity<UserResponse> removeRoleFromUser(@PathVariable Long id, @RequestParam String roleName) {
        User updatedUser = userService.removeRoleFromUser(id, roleName);
        return ResponseEntity.ok(convertToUserResponse(updatedUser));
    }

    /**
     * Sucht User mit Suchbegriff
     * @param searchTerm Suchbegriff
     * @return ResponseEntity mit Liste mit gefundenen UserResponse-DTOs
     */
    @GetMapping("/users/search")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String searchTerm) {
        List<User> users = userService.searchUsers(searchTerm);
        List<UserResponse> responses = users.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    /**
     * Setzt das Passwort eines bestehenden Users zurück
     * @param id
     * @return ResponseEntity mit Meldung und temporären Passwort
     */
    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetUserPassword(@PathVariable Long id) {
        String tempPassword = userService.resetPasswordToTemporary(id);
        return ResponseEntity.ok(Map.of(
                "message", "Passwort zurückgesetzt",
                "temporaryPassword", tempPassword,
                "userId", id
        ));
    }

    /**
     * Konvertiert ein User-Objekt in ein UserResponse-DTO
     * @param user
     * @return UserResponse-DTO mit Daten aus dem User-Objekt
     * Quelle: https://www.geeksforgeeks.org/spring-boot-map-entity-to-dto-using-modelmapper/
     * Quelle: https://techkluster.com/2023/08/21/dto-for-a-java-spring-application/
     * Quelle: https://medium.com/paysafe-bulgaria/springboot-dto-validation-good-practices-and-breakdown-fee69277b3b0
     */
    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();

        // Daten von Quellobjekt auf Zielobjekt kopieren
        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setActive(user.isActive());
        response.setStatus(user.getStatus());
        response.setPlannedHoursPerDay(user.getPlannedHoursPerDay());

        // Rollen Name extrahieren und in Set speichern, keine Mehrfachnennung möglich
        // Quelle ChatGPT.com
        response.setRoles(user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet()));

        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());

        return response;
    }
}
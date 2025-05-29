package ch.fhnw.timerecordingbackend.controller;

import ch.fhnw.timerecordingbackend.dto.admin.UserRegistrationRequest;
import ch.fhnw.timerecordingbackend.dto.admin.UserResponse;
import ch.fhnw.timerecordingbackend.dto.registration.RegistrationRequest;
import ch.fhnw.timerecordingbackend.model.Registration;
import ch.fhnw.timerecordingbackend.model.Role;
import ch.fhnw.timerecordingbackend.model.User;
import ch.fhnw.timerecordingbackend.model.enums.UserStatus;
import ch.fhnw.timerecordingbackend.service.RegistrationService;
import ch.fhnw.timerecordingbackend.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import ch.fhnw.timerecordingbackend.model.SystemLog;
import ch.fhnw.timerecordingbackend.repository.SystemLogRepository;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


/**
 * REST Controller für Administratoren
 * API Endpunkte für Vewaltung von Benutzern
 * @author PD
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 */

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final RegistrationService registrationService;

    @Autowired
    private SystemLogRepository systemLogRepository;

    @Autowired
    public AdminController(UserService userService, PasswordEncoder passwordEncoder, RegistrationService registrationService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.registrationService = registrationService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userService.findAllUsers();
        List<UserResponse> responses = users.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(this::convertToUserResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        List<Role> roles = userService.getAllRoles();
        return ResponseEntity.ok(roles);
    }

    /**
     * Empfängt Regestrierungsanfrage
     * @return
     */
    @GetMapping("/registration-requests/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingRegistrationRequests() {
        List<Registration> requests = registrationService.getAllPendingRequests();
        List<Map<String, Object>> responses = requests.stream()
                .map(request -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", request.getId());
                    map.put("firstName", request.getFirstName());
                    map.put("lastName", request.getLastName());
                    map.put("email", request.getEmail());
                    map.put("requestedRole", request.getRequestedRole());
                    map.put("managerName", request.getManager() != null ? request.getManager().getFullName() : "N/A");
                    map.put("createdAt", request.getCreatedAt());
                    map.put("status", request.getStatus());
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
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

        String passwordToEncode = request.getPassword();
        if (passwordToEncode == null || passwordToEncode.isEmpty()) {
            passwordToEncode = request.getLastName().toLowerCase();
        }
        user.setPassword(passwordEncoder.encode(passwordToEncode));

        User createdUser = userService.createUser(user, request.getRole());
        UserResponse response = convertToUserResponse(createdUser);
        response.setTemporaryPassword(passwordToEncode); // Das unverschlüsselte Passwort für die Anzeige

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

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

    @PatchMapping("/user/{id}/deactivate")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable Long id) {
        User deactivatedUser = userService.deactivateUser(id);
        return ResponseEntity.ok(convertToUserResponse(deactivatedUser));
    }

    /**
     * Genehmigt Regestrierungs Anfrage
     * @param id
     * @return
     */
    @PatchMapping("/registration-requests/{id}/approve")
    public ResponseEntity<Map<String, String>> approveRegistrationRequest(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String adminEmail = authentication.getName(); // E-Mail des angemeldeten Admins
        registrationService.approveRegistrationRequest(id, adminEmail);
        return ResponseEntity.ok(Map.of("message", "Registrierungsanfrage genehmigt und Benutzer erstellt."));
    }

    /**
     * Lehnt regestrierungsanfrage ab
     * @param id
     * @return
     */
    @PatchMapping("/registration-requests/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectRegistrationRequest(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String adminEmail = authentication.getName();

            registrationService.rejectRegistrationRequest(id, adminEmail);

            return ResponseEntity.ok(Map.of(
                    "message", "Registrierungsanfrage wurde abgelehnt und aus der Datenbank entfernt. Der Nutzer kann sich erneut registrieren."
            ));

        } catch (ValidationException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Ein unerwarteter Fehler ist aufgetreten."
            ));
        }
    }

    /**
     * Aktiviert einen bestehenden User
     * @param id
     * @return ResponseEntity mit dem aktivierten UserResponse-DTO
     */
    @PatchMapping("/users/{id}/activate")
    public ResponseEntity<UserResponse> activateUser(@PathVariable Long id) {
        User activatedUser = userService.activateUser(id);
        return ResponseEntity.ok(convertToUserResponse(activatedUser));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<UserResponse> changeUserStatus(@PathVariable Long id, @RequestParam UserStatus status) {
        User updatedUser = userService.updateUserStatus(id, status);
        return ResponseEntity.ok(convertToUserResponse(updatedUser));
    }

    @PostMapping("/users/{id}/roles")
    public ResponseEntity<UserResponse> addRoleToUser(@PathVariable Long id, @RequestParam String roleName) {
        User updatedUser = userService.addRoleToUser(id, roleName);
        return ResponseEntity.ok(convertToUserResponse(updatedUser));
    }

    @DeleteMapping("/users/{id}/roles")
    public ResponseEntity<UserResponse> removeRoleFromUser(@PathVariable Long id, @RequestParam String roleName) {
        User updatedUser = userService.removeRoleFromUser(id, roleName);
        return ResponseEntity.ok(convertToUserResponse(updatedUser));
    }

    @GetMapping("/users/search")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String searchTerm) {
        List<User> users = userService.searchUsers(searchTerm);
        List<UserResponse> responses = users.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetUserPassword(@PathVariable Long id) {
        String tempPassword = userService.resetPasswordToTemporary(id);
        return ResponseEntity.ok(Map.of(
                "message", "Passwort zurückgesetzt",
                "temporaryPassword", tempPassword,
                "userId", id
        ));
    }

    // NEUER ENDPUNKT zum Abrufen von System-Logs
    @GetMapping("/logs")
    public ResponseEntity<?> getSystemLogs() {
        List<SystemLog> logs = systemLogRepository.findAll(Sort.by(Sort.Direction.DESC, "timestamp"));
        return ResponseEntity.ok(Map.of("logs", logs));
    }

    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setActive(user.isActive());
        response.setStatus(user.getStatus());
        response.setPlannedHoursPerDay(user.getPlannedHoursPerDay());
        response.setRoles(user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet()));
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}
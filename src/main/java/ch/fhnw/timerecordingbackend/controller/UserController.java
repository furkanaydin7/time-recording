package ch.fhnw.timerecordingbackend.controller;

import ch.fhnw.timerecordingbackend.dto.ChangePasswordRequest;
import ch.fhnw.timerecordingbackend.dto.ResetPasswordRequest;
import ch.fhnw.timerecordingbackend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PutMapping( "/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok().body(
                java.util.Map.of("message", "Passwort erfolgreich geändert")
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String email = request.getEmail();
        userService.sendPasswordResetLink(email);
        return ResponseEntity.ok().body(
                java.util.Map.of(
                        "message", "Reset-Link gesendet"
                )
        );
    }
}

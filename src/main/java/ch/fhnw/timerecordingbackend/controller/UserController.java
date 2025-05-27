package ch.fhnw.timerecordingbackend.controller;

import ch.fhnw.timerecordingbackend.dto.authentication.ChangePasswordRequest;
import ch.fhnw.timerecordingbackend.dto.authentication.ResetPasswordRequest;
import ch.fhnw.timerecordingbackend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller für Benutzer
 * @author FA
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.1 - sendpasswortresetlink entfernt - PD
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PutMapping( "/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok().body(
                java.util.Map.of("message", "Passwort geändert")
        );
    }

}

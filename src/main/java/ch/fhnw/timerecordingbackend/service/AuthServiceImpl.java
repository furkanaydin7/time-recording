package ch.fhnw.timerecordingbackend.service;

import ch.fhnw.timerecordingbackend.dto.authentication.LoginRequest;
import ch.fhnw.timerecordingbackend.dto.authentication.LoginResponse;
import ch.fhnw.timerecordingbackend.model.SystemLog;
import ch.fhnw.timerecordingbackend.model.User;
import ch.fhnw.timerecordingbackend.repository.SystemLogRepository;
import ch.fhnw.timerecordingbackend.repository.UserRepository;
import ch.fhnw.timerecordingbackend.security.JwtTokenProvider;
import ch.fhnw.timerecordingbackend.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service-Implementierung für Authentifizierung
 * Behandelt Login, Logout und Token-Verwaltung
 * @author FA
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * Quelle: ChatGPT
 */
@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SystemLogRepository systemLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SecurityUtils securityUtils;

    /**
     * Authentifiziert einen Benutzer und gibt Token mit Benutzerinformationen zurück
     *
     * @param loginRequest Enthält E-Mail und Passwort
     * @return LoginResponse mit JWT-Token und Benutzerinformationen
     * @throws BadCredentialsException wenn Login-Daten ungültig sind
     * @throws DisabledException wenn Benutzerkonto deaktiviert ist
     */
    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        try {
            // Benutzer vor Authentifizierung laden für Aktivitätsprüfung
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new BadCredentialsException("Ungültige Login-Daten"));

            // Prüfen ob Benutzer aktiv ist
            if (!user.isActive()) {
                logAuthActivity(user, "Login failed", "Account disabled");
                throw new DisabledException("Benutzerkonto ist deaktiviert");
            }

            // Spring Security Authentifizierung verwenden
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            // Authentication im SecurityContext setzen
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // JWT-Token generieren
            String jwt = tokenProvider.generateToken(authentication);

            // Primäre Rolle bestimmen (erste Rolle falls mehrere vorhanden)
            String primaryRole = user.getRoles().isEmpty() ?
                    "EMPLOYEE" :
                    user.getRoles().iterator().next().getName();

            // UserDto für Response erstellen
            LoginResponse.UserDto userDto = new LoginResponse.UserDto(
                    user.getId(),
                    user.getFullName(),
                    primaryRole
            );

            // Erfolgreichen Login protokollieren
            logAuthActivity(user, "User logged in", "Login successful");

            return new LoginResponse(jwt, userDto);

        } catch (AuthenticationException e) {
            // Fehlgeschlagenen Login protokollieren falls Benutzer existiert
            userRepository.findByEmail(loginRequest.getEmail())
                    .ifPresent(user -> logAuthActivity(user, "Login failed", "Invalid credentials"));

            // Spezifische Exception-Behandlung
            if (e instanceof DisabledException) {
                throw e; // DisabledException weiterwerfen
            } else {
                throw new BadCredentialsException("Ungültige Login-Daten");
            }
        }
    }

    /**
     * Loggt einen Benutzer aus und invalidiert das Token
     *
     * @param token Das zu invalidierende JWT-Token (mit oder ohne "Bearer " Prefix)
     */
    @Override
    public void logout(String token) {
        // "Bearer " Prefix entfernen falls vorhanden
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        if (token == null || token.trim().isEmpty()) {
            return;
        }

        // Token zur Blacklist hinzufügen
        tokenProvider.blacklistToken(token);

        try {
            // Aktuellen Benutzer für Logging holen
            User user = securityUtils.getCurrentUser();

            if (user != null) {
                logAuthActivity(user, "User logged out", "Logout successful");
            }
        } catch (Exception e) {
            // Falls aktueller Benutzer nicht ermittelt werden kann, trotzdem Token blacklisten
            System.err.println("Warnung: Aktueller Benutzer konnte beim Logout nicht ermittelt werden: " + e.getMessage());
        }
    }

    /**
     * Protokolliert Authentifizierungs-Aktivitäten
     */
    private void logAuthActivity(User user, String action, String details) {
        SystemLog log = new SystemLog();
        log.setUserId(user.getId());
        log.setUserEmail(user.getEmail());
        log.setAction(action);
        log.setDetails(details);
        log.setTimestamp(LocalDateTime.now());
        systemLogRepository.save(log);
    }
}
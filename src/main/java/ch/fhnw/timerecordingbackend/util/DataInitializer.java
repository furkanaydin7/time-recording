package ch.fhnw.timerecordingbackend.util;

import ch.fhnw.timerecordingbackend.model.*;
import ch.fhnw.timerecordingbackend.model.enums.AbsenceType;
import ch.fhnw.timerecordingbackend.model.enums.UserStatus;
import ch.fhnw.timerecordingbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

/**
 * DataInitializer für Initialdaten beim Start der Anwendung
 * Erstellt Standard-Rollen, Admin-Benutzer und Beispieldaten
 * @author PD
 * @version 1.0
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ProjectRepository projectRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final AbsenceRepository absenceRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataInitializer(
            UserRepository userRepository,
            RoleRepository roleRepository,
            ProjectRepository projectRepository,
            TimeEntryRepository timeEntryRepository,
            AbsenceRepository absenceRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.projectRepository = projectRepository;
        this.timeEntryRepository = timeEntryRepository;
        this.absenceRepository = absenceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🚀 DataInitializer gestartet - Erstelle Initialdaten...");

        // Nur ausführen wenn keine Daten vorhanden
        if (userRepository.count() == 0) {
            initializeRoles();
            initializeAdminUser();
            initializeExampleUsers();
            initializeExampleProjects();
            initializeExampleTimeEntries();
            initializeExampleAbsences();

            System.out.println("✅ Initialdaten erfolgreich erstellt!");
        } else {
            System.out.println("ℹ️ Datenbank bereits initialisiert - keine Aktion erforderlich");
        }
    }

    /**
     * Erstellt Standard-Rollen
     */
    private void initializeRoles() {
        System.out.println("📋 Erstelle Standard-Rollen...");

        String[] roleNames = {"ADMIN", "MANAGER", "EMPLOYEE"};
        String[] roleDescriptions = {
                "Systemadministrator mit vollen Zugriffsrechten",
                "Projektmanager mit erweiterten Berechtigungen",
                "Standard-Mitarbeiter mit grundlegenden Berechtigungen"
        };

        for (int i = 0; i < roleNames.length; i++) {
            if (!roleRepository.existsByName(roleNames[i])) {
                Role role = new Role(roleNames[i], roleDescriptions[i]);
                roleRepository.save(role);
                System.out.println("  ✓ Rolle erstellt: " + roleNames[i]);
            }
        }
    }

    /**
     * Erstellt Standard-Admin-Benutzer
     */
    private void initializeAdminUser() {
        System.out.println("👤 Erstelle Admin-Benutzer...");

        if (!userRepository.existsByEmail("admin@timerecording.ch")) {
            // Admin-Rolle laden
            Role adminRole = roleRepository.findByName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Admin-Rolle nicht gefunden"));

            // Admin-Benutzer erstellen
            User admin = new User();
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setEmail("admin@timerecording.ch");
            admin.setPassword(passwordEncoder.encode("admin123")); // Standard-Passwort
            admin.setPlannedHoursPerDay(8.0);
            admin.setStatus(UserStatus.ACTIVE);
            admin.setActive(true);
            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());

            // Rolle zuweisen
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            admin.setRoles(roles);

            userRepository.save(admin);
            System.out.println("  ✓ Admin-Benutzer erstellt: admin@timerecording.ch (Passwort: admin123)");
        }
    }

    /**
     * Erstellt Beispiel-Benutzer
     */
    private void initializeExampleUsers() {
        System.out.println("👥 Erstelle Beispiel-Benutzer...");

        // Employee-Rolle laden
        Role employeeRole = roleRepository.findByName("EMPLOYEE")
                .orElseThrow(() -> new RuntimeException("Employee-Rolle nicht gefunden"));
        Role managerRole = roleRepository.findByName("MANAGER")
                .orElseThrow(() -> new RuntimeException("Manager-Rolle nicht gefunden"));

        // Beispiel-Manager
        if (!userRepository.existsByEmail("manager@timerecording.ch")) {
            User manager = createExampleUser(
                    "Max", "Mustermann", "manager@timerecording.ch",
                    "manager123", managerRole);
            userRepository.save(manager);
            System.out.println("  ✓ Manager erstellt: manager@timerecording.ch (Passwort: manager123)");
        }

        // Beispiel-Mitarbeiter
        String[][] employees = {
                {"Anna", "Schmidt", "anna.schmidt@timerecording.ch"},
                {"Peter", "Müller", "peter.mueller@timerecording.ch"},
                {"Laura", "Weber", "laura.weber@timerecording.ch"},
                {"Thomas", "Fischer", "thomas.fischer@timerecording.ch"}
        };

        for (String[] emp : employees) {
            if (!userRepository.existsByEmail(emp[2])) {
                User employee = createExampleUser(emp[0], emp[1], emp[2], "employee123", employeeRole);
                userRepository.save(employee);
                System.out.println("  ✓ Mitarbeiter erstellt: " + emp[2] + " (Passwort: employee123)");
            }
        }
    }

    /**
     * Hilfsmethode zum Erstellen von Beispiel-Benutzern
     */
    private User createExampleUser(String firstName, String lastName, String email, String password, Role role) {
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setPlannedHoursPerDay(8.0);
        user.setStatus(UserStatus.ACTIVE);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        return user;
    }

    /**
     * Erstellt Beispiel-Projekte
     */
    private void initializeExampleProjects() {
        System.out.println("📁 Erstelle Beispiel-Projekte...");

        User manager = userRepository.findByEmail("manager@timerecording.ch").orElse(null);

        String[][] projects = {
                {"Website Redesign", "Neugestaltung der Unternehmenswebsite"},
                {"Mobile App Development", "Entwicklung einer mobilen Zeiterfassungs-App"},
                {"Database Migration", "Migration der Datenbank auf neue Infrastruktur"},
                {"Security Audit", "Sicherheitsüberprüfung aller Systeme"},
                {"Training Program", "Schulungsprogramm für neue Mitarbeiter"}
        };

        for (String[] proj : projects) {
            if (!projectRepository.existsByName(proj[0])) {
                Project project = new Project(proj[0], proj[1]);
                if (manager != null) {
                    project.setManager(manager);
                }
                projectRepository.save(project);
                System.out.println("  ✓ Projekt erstellt: " + proj[0]);
            }
        }
    }

    /**
     * Erstellt Beispiel-Zeiteinträge
     */
    private void initializeExampleTimeEntries() {
        System.out.println("⏰ Erstelle Beispiel-Zeiteinträge...");

        User anna = userRepository.findByEmail("anna.schmidt@timerecording.ch").orElse(null);
        User peter = userRepository.findByEmail("peter.mueller@timerecording.ch").orElse(null);
        Project websiteProject = projectRepository.findByName("Website Redesign").orElse(null);

        if (anna != null && websiteProject != null) {
            // Zeiteinträge für Anna (letzte Woche)
            for (int i = 1; i <= 5; i++) {
                LocalDate workDate = LocalDate.now().minusDays(i);

                if (!timeEntryRepository.existsByUserAndDate(anna, workDate)) {
                    TimeEntry entry = createExampleTimeEntry(anna, workDate, websiteProject);
                    timeEntryRepository.save(entry);
                }
            }
            System.out.println("  ✓ Zeiteinträge für Anna Schmidt erstellt");
        }

        if (peter != null && websiteProject != null) {
            // Zeiteinträge für Peter (diese Woche)
            for (int i = 1; i <= 3; i++) {
                LocalDate workDate = LocalDate.now().minusDays(i);

                if (!timeEntryRepository.existsByUserAndDate(peter, workDate)) {
                    TimeEntry entry = createExampleTimeEntry(peter, workDate, websiteProject);
                    timeEntryRepository.save(entry);
                }
            }
            System.out.println("  ✓ Zeiteinträge für Peter Müller erstellt");
        }
    }

    /**
     * Hilfsmethode zum Erstellen von Beispiel-Zeiteinträgen
     */
    private TimeEntry createExampleTimeEntry(User user, LocalDate date, Project project) {
        TimeEntry entry = new TimeEntry();
        entry.setUser(user);
        entry.setDate(date);
        entry.setProject(project);

        // Beispiel-Arbeitszeiten
        entry.addStartTime(LocalTime.of(8, 0));
        entry.addEndTime(LocalTime.of(12, 0));
        entry.addStartTime(LocalTime.of(13, 0));
        entry.addEndTime(LocalTime.of(17, 0));

        // Pause hinzufügen
        entry.addBreak(LocalTime.of(12, 0), LocalTime.of(13, 0));

        // Zeiten berechnen
        entry.setActualHours("08:00");
        entry.setPlannedHours("08:00");
        entry.setDifference("00:00");

        entry.setCreatedAt(LocalDateTime.now());
        entry.setUpdatedAt(LocalDateTime.now());

        return entry;
    }

    /**
     * Erstellt Beispiel-Abwesenheiten
     */
    private void initializeExampleAbsences() {
        System.out.println("🏖️ Erstelle Beispiel-Abwesenheiten...");

        User laura = userRepository.findByEmail("laura.weber@timerecording.ch").orElse(null);
        User thomas = userRepository.findByEmail("thomas.fischer@timerecording.ch").orElse(null);
        User admin = userRepository.findByEmail("admin@timerecording.ch").orElse(null);

        if (laura != null) {
            // Genehmigter Urlaub für Laura (nächste Woche)
            Absence vacation = new Absence();
            vacation.setUser(laura);
            vacation.setStartDate(LocalDate.now().plusDays(7));
            vacation.setEndDate(LocalDate.now().plusDays(11));
            vacation.setType(AbsenceType.VACATION);
            vacation.setApproved(true);
            vacation.setApprover(admin);
            vacation.setCreatedAt(LocalDateTime.now());
            vacation.setUpdatedAt(LocalDateTime.now());

            absenceRepository.save(vacation);
            System.out.println("  ✓ Urlaub für Laura Weber erstellt (genehmigt)");
        }

        if (thomas != null) {
            // Ausstehende Fortbildung für Thomas
            Absence training = new Absence();
            training.setUser(thomas);
            training.setStartDate(LocalDate.now().plusDays(14));
            training.setEndDate(LocalDate.now().plusDays(16));
            training.setType(AbsenceType.TRAINING);
            training.setApproved(false);
            training.setCreatedAt(LocalDateTime.now());
            training.setUpdatedAt(LocalDateTime.now());

            absenceRepository.save(training);
            System.out.println("  ✓ Fortbildung für Thomas Fischer erstellt (ausstehend)");
        }
    }
}

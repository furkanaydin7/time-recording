package ch.fhnw.timerecordingbackend.util;

import ch.fhnw.timerecordingbackend.model.*;
import ch.fhnw.timerecordingbackend.model.enums.UserStatus;
import ch.fhnw.timerecordingbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * DataInitializer für Initialdaten beim Start der Anwendung
 * Erstellt Standard-Rollen, Admin-Benutzer und Beispieldaten
 * @author PD
 * @version 1.0
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // WICHTIG: PasswordEncoder injizieren!

    @Override
    public void run(String... args) throws Exception {
        // NUR beim ersten Start ausführen (wenn keine User da sind)
        if (userRepository.count() == 0) {
            System.out.println("🚀 DataInitializer gestartet - Erstelle Initialdaten...");
            createRoles();
            createUsers();
            createProjects();
            System.out.println("✅ Initialdaten erfolgreich erstellt!");
        } else {
            System.out.println("📊 Datenbank enthält bereits " + userRepository.count() + " Benutzer - überspringe Initialisierung");
        }
    }

    // Erweitere createMoreUsers() für Test-User:
    private void createMoreUsers() {
        Role employeeRole = roleRepository.findByName("EMPLOYEE")
                .orElseThrow(() -> new RuntimeException("Employee role not found"));

        // Test User für Datenbank-Tests
        if (!userRepository.existsByEmail("max.database@timerecording.ch")) {
            User maxDb = new User();
            maxDb.setFirstName("Max");
            maxDb.setLastName("Database");
            maxDb.setEmail("max.database@timerecording.ch");
            maxDb.setPassword(passwordEncoder.encode("password123"));
            maxDb.setActive(true);
            maxDb.setStatus(UserStatus.ACTIVE);
            maxDb.setPlannedHoursPerDay(8.0);
            maxDb.setRoles(Set.of(employeeRole));
            userRepository.save(maxDb);
            System.out.println("  ✓ Test-User erstellt: max.database@timerecording.ch");
        }

    }
    /**
     * Erstellt Standard-Rollen
     */
    private void createRoles() {
        System.out.println("📋 Erstelle Standard-Rollen...");

        // Admin-Rolle
        if (!roleRepository.existsByName("ADMIN")) {
            Role adminRole = new Role();
            adminRole.setName("ADMIN");
            adminRole.setDescription("System Administrator");
            roleRepository.save(adminRole);
            System.out.println("  ✓ Rolle erstellt: ADMIN");
        }

        // Manager-Rolle
        if (!roleRepository.existsByName("MANAGER")) {
            Role managerRole = new Role();
            managerRole.setName("MANAGER");
            managerRole.setDescription("Project Manager");
            roleRepository.save(managerRole);
            System.out.println("  ✓ Rolle erstellt: MANAGER");
        }

        // Employee-Rolle
        if (!roleRepository.existsByName("EMPLOYEE")) {
            Role employeeRole = new Role();
            employeeRole.setName("EMPLOYEE");
            employeeRole.setDescription("Employee");
            roleRepository.save(employeeRole);
            System.out.println("  ✓ Rolle erstellt: EMPLOYEE");
        }
    }
    /**
     * Erstellt Standard-Benutzer
     */
    private void createUsers() {
        System.out.println("👤 Erstelle Admin-Benutzer...");

        // Admin-Benutzer
        if (!userRepository.existsByEmail("admin@timerecording.ch")) {
            Role adminRole = roleRepository.findByName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));

            User admin = new User();
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setEmail("admin@timerecording.ch");
            admin.setPassword(passwordEncoder.encode("admin123")); // ← WICHTIG: encode() verwenden!
            admin.setActive(true);
            admin.setStatus(UserStatus.ACTIVE);
            admin.setPlannedHoursPerDay(8.0);
            admin.setRoles(Set.of(adminRole));

            userRepository.save(admin);
            System.out.println("  ✓ Admin-Benutzer erstellt: admin@timerecording.ch (Passwort: admin123)");
        }

        System.out.println("👥 Erstelle Beispiel-Benutzer...");

        // Manager-Benutzer
        if (!userRepository.existsByEmail("manager@timerecording.ch")) {
            Role managerRole = roleRepository.findByName("MANAGER")
                    .orElseThrow(() -> new RuntimeException("Manager role not found"));

            User manager = new User();
            manager.setFirstName("Max");
            manager.setLastName("Manager");
            manager.setEmail("manager@timerecording.ch");
            manager.setPassword(passwordEncoder.encode("manager123")); // ← WICHTIG!
            manager.setActive(true);
            manager.setStatus(UserStatus.ACTIVE);
            manager.setPlannedHoursPerDay(8.0);
            manager.setRoles(Set.of(managerRole));

            userRepository.save(manager);
            System.out.println("  ✓ Manager erstellt: manager@timerecording.ch (Passwort: manager123)");
        }

        // Employee-Benutzer
        if (!userRepository.existsByEmail("anna.schmidt@timerecording.ch")) {
            Role employeeRole = roleRepository.findByName("EMPLOYEE")
                    .orElseThrow(() -> new RuntimeException("Employee role not found"));

            User employee = new User();
            employee.setFirstName("Anna");
            employee.setLastName("Schmidt");
            employee.setEmail("anna.schmidt@timerecording.ch");
            employee.setPassword(passwordEncoder.encode("employee123")); // ← WICHTIG!
            employee.setActive(true);
            employee.setStatus(UserStatus.ACTIVE);
            employee.setPlannedHoursPerDay(8.0);
            employee.setRoles(Set.of(employeeRole));

            userRepository.save(employee);
            System.out.println("  ✓ Mitarbeiter erstellt: anna.schmidt@timerecording.ch (Passwort: employee123)");
        }

        // Weitere Beispiel-Benutzer...
        createMoreUsers();
    }
    /**
     * Erstellt Beispiel-Mitarbeiter
     */

    /**
     * Erstellt Beispiel-Projekte
     */
    private void createProjects() {
        System.out.println("📁 Erstelle Beispiel-Projekte...");

        User manager = userRepository.findByEmail("manager@timerecording.ch")
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        // Website Redesign
        if (!projectRepository.existsByName("Website Redesign")) {
            Project project1 = new Project();
            project1.setName("Website Redesign");
            project1.setDescription("Komplette Überarbeitung der Unternehmenswebsite");
            project1.setActive(true);
            project1.setManager(manager);
            projectRepository.save(project1);
            System.out.println("  ✓ Projekt erstellt: Website Redesign");
        }

        // Mobile App Development
        if (!projectRepository.existsByName("Mobile App Development")) {
            Project project2 = new Project();
            project2.setName("Mobile App Development");
            project2.setDescription("Entwicklung einer mobilen App für iOS und Android");
            project2.setActive(true);
            project2.setManager(manager);
            projectRepository.save(project2);
            System.out.println("  ✓ Projekt erstellt: Mobile App Development");
        }

        // Database Migration
        if (!projectRepository.existsByName("Database Migration")) {
            Project project3 = new Project();
            project3.setName("Database Migration");
            project3.setDescription("Migration der Legacy-Datenbank zu einer modernen Lösung");
            project3.setActive(true);
            project3.setManager(manager);
            projectRepository.save(project3);
            System.out.println("  ✓ Projekt erstellt: Database Migration");
        }
    }
}
package ch.fhnw.timerecordingbackend.config;

import ch.fhnw.timerecordingbackend.model.*;
import ch.fhnw.timerecordingbackend.model.enums.UserStatus;
import ch.fhnw.timerecordingbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

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
        if (userRepository.count() == 0) {
            System.out.println("🚀 DataInitializer gestartet - Erstelle Initialdaten...");

            createRoles();
            createUsers();
            createProjects();

            System.out.println("✅ Initialdaten erfolgreich erstellt!");
        }
    }

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

    private void createMoreUsers() {
        Role employeeRole = roleRepository.findByName("EMPLOYEE")
                .orElseThrow(() -> new RuntimeException("Employee role not found"));

        // Peter Müller
        if (!userRepository.existsByEmail("peter.mueller@timerecording.ch")) {
            User peter = new User();
            peter.setFirstName("Peter");
            peter.setLastName("Müller");
            peter.setEmail("peter.mueller@timerecording.ch");
            peter.setPassword(passwordEncoder.encode("employee123"));
            peter.setActive(true);
            peter.setStatus(UserStatus.ACTIVE);
            peter.setPlannedHoursPerDay(8.0);
            peter.setRoles(Set.of(employeeRole));
            userRepository.save(peter);
            System.out.println("  ✓ Mitarbeiter erstellt: peter.mueller@timerecording.ch (Passwort: employee123)");
        }

        // Laura Weber
        if (!userRepository.existsByEmail("laura.weber@timerecording.ch")) {
            User laura = new User();
            laura.setFirstName("Laura");
            laura.setLastName("Weber");
            laura.setEmail("laura.weber@timerecording.ch");
            laura.setPassword(passwordEncoder.encode("employee123"));
            laura.setActive(true);
            laura.setStatus(UserStatus.ACTIVE);
            laura.setPlannedHoursPerDay(8.0);
            laura.setRoles(Set.of(employeeRole));
            userRepository.save(laura);
            System.out.println("  ✓ Mitarbeiter erstellt: laura.weber@timerecording.ch (Passwort: employee123)");
        }

        // Thomas Fischer
        if (!userRepository.existsByEmail("thomas.fischer@timerecording.ch")) {
            User thomas = new User();
            thomas.setFirstName("Thomas");
            thomas.setLastName("Fischer");
            thomas.setEmail("thomas.fischer@timerecording.ch");
            thomas.setPassword(passwordEncoder.encode("employee123"));
            thomas.setActive(true);
            thomas.setStatus(UserStatus.ACTIVE);
            thomas.setPlannedHoursPerDay(8.0);
            thomas.setRoles(Set.of(employeeRole));
            userRepository.save(thomas);
            System.out.println("  ✓ Mitarbeiter erstellt: thomas.fischer@timerecording.ch (Passwort: employee123)");
        }
    }

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
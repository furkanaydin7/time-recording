package ch.fhnw.timerecordingbackend.controller;

import ch.fhnw.timerecordingbackend.dto.project.ProjectRequest;
import ch.fhnw.timerecordingbackend.dto.project.ProjectResponse;
import ch.fhnw.timerecordingbackend.model.Project;
import ch.fhnw.timerecordingbackend.model.User;
import ch.fhnw.timerecordingbackend.service.ProjectService;
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

/**
 * REST Controller für Administratoren
 * API Endpunkte für Vewaltung von Benutzern
 * @author PD
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.1 - API Pfad geändert
 */
@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectService projectService;
    private final UserService userService;

    @Autowired
    public ProjectController(ProjectService projectService, UserService userService) {
        this.projectService = projectService;
        this.userService = userService;
    }

    /**
     * Alle Projekte abrufen (nur Admin)
     * GET /api/projects
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, List<ProjectResponse>>> getAllProjects() {
        List<Project> projects = projectService.findAllProjects();
        List<ProjectResponse> responses = projects.stream()
                .map(this::convertToProjectResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("projects", responses));
    }

    /**
     * Alle aktiven Projekte abrufen
     * GET /api/projects/active
     */
    @GetMapping("/active")
    public ResponseEntity<Map<String, List<ProjectResponse>>> getActiveProjects() {
        List<Project> projects = projectService.findActiveProjects();
        List<ProjectResponse> responses = projects.stream()
                .map(this::convertToProjectResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("projects", responses));
    }

    /**
     * Projekt anhand ID abrufen
     * GET /api/projects/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Long id) {
        return projectService.findById(id)
                .map(this::convertToProjectResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Neues Projekt erstellen (nur Admin)
     * POST /api/projects
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createProject(@Valid @RequestBody ProjectRequest request) {
        // Projekt erstellen
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());

        // Manager zuweisen falls angegeben
        if (request.getManagerId() != null) {
            User manager = userService.findById(request.getManagerId())
                    .orElseThrow(() -> new IllegalArgumentException("Manager nicht gefunden mit ID: " + request.getManagerId()));
            project.setManager(manager);
        }

        Project createdProject = projectService.createProject(project);

        return new ResponseEntity<>(
                Map.of(
                        "id", createdProject.getId(),
                        "message", "Projekt erfolgreich erstellt"
                ),
                HttpStatus.CREATED
        );
    }

    /**
     * Projekt aktualisieren (nur Admin und zugewiesener Manager)
     * PUT /api/projects/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @projectController.isProjectManager(#id)")
    public ResponseEntity<Map<String, String>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request) {

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());

        // Manager zuweisen falls angegeben
        if (request.getManagerId() != null) {
            User manager = userService.findById(request.getManagerId())
                    .orElseThrow(() -> new IllegalArgumentException("Manager nicht gefunden mit ID: " + request.getManagerId()));
            project.setManager(manager);
        }

        projectService.updateProject(id, project);

        return ResponseEntity.ok(Map.of("message", "Projekt erfolgreich aktualisiert"));
    }

    /**
     * Projekt deaktivieren (nur Admin)
     * PATCH /api/projects/{id}/deactivate
     */
    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deactivateProject(@PathVariable Long id) {
        projectService.deactivateProject(id);
        return ResponseEntity.ok(Map.of("message", "Projekt deaktiviert"));
    }

    /**
     * Projekt aktivieren (nur Admin)
     * PATCH /api/projects/{id}/activate
     */
    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> activateProject(@PathVariable Long id) {
        projectService.activateProject(id);
        return ResponseEntity.ok(Map.of("message", "Projekt aktiviert"));
    }

    /**
     * Manager einem Projekt zuweisen (nur Admin)
     * POST /api/projects/{id}/manager
     */
    @PostMapping("/{id}/manager")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> assignManager(
            @PathVariable Long id,
            @RequestBody Map<String, Long> requestBody) {

        Long managerId = requestBody.get("managerId");
        if (managerId == null) {
            throw new IllegalArgumentException("Manager ID ist erforderlich");
        }

        projectService.assignManager(id, managerId);
        return ResponseEntity.ok(Map.of("message", "Manager erfolgreich zugewiesen"));
    }

    /**
     * Manager von Projekt entfernen (nur Admin)
     * DELETE /api/projects/{id}/manager
     */
    @DeleteMapping("/{id}/manager")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> removeManager(@PathVariable Long id) {
        projectService.removeManager(id);
        return ResponseEntity.ok(Map.of("message", "Manager erfolgreich entfernt"));
    }

    /**
     * Projekte suchen
     * GET /api/projects/search?term=suchbegriff
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, List<ProjectResponse>>> searchProjects(
            @RequestParam String term) {

        List<Project> projects = projectService.searchProjects(term);
        List<ProjectResponse> responses = projects.stream()
                .map(this::convertToProjectResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("projects", responses));
    }

    /**
     * Projekte eines bestimmten Benutzers abrufen
     * GET /api/projects/user/{userId}
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<Map<String, List<ProjectResponse>>> getProjectsByUserId(@PathVariable Long userId) {
        List<Project> projects = projectService.findProjectsByUserId(userId);
        List<ProjectResponse> responses = projects.stream()
                .map(this::convertToProjectResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("projects", responses));
    }

    /**
     * Aktive Projekte eines bestimmten Benutzers abrufen
     * GET /api/projects/user/{userId}/active
     */
    @GetMapping("/user/{userId}/active")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<Map<String, List<ProjectResponse>>> getActiveProjectsByUserId(@PathVariable Long userId) {
        List<Project> projects = projectService.findActiveProjectsByUserId(userId);
        List<ProjectResponse> responses = projects.stream()
                .map(this::convertToProjectResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("projects", responses));
    }

    /**
     * Projekte eines bestimmten Managers abrufen
     * GET /api/projects/manager/{managerId}
     */
    @GetMapping("/manager/{managerId}")
    @PreAuthorize("hasRole('ADMIN') or #managerId == authentication.principal.id")
    public ResponseEntity<Map<String, List<ProjectResponse>>> getProjectsByManagerId(@PathVariable Long managerId) {
        List<Project> projects = projectService.findProjectsByManagerId(managerId);
        List<ProjectResponse> responses = projects.stream()
                .map(this::convertToProjectResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("projects", responses));
    }

    /**
     * Aktive Projekte eines bestimmten Managers abrufen
     * GET /api/projects/manager/{managerId}/active
     */
    @GetMapping("/manager/{managerId}/active")
    @PreAuthorize("hasRole('ADMIN') or #managerId == authentication.principal.id")
    public ResponseEntity<Map<String, List<ProjectResponse>>> getActiveProjectsByManagerId(@PathVariable Long managerId) {
        List<Project> projects = projectService.findActiveProjectsByManagerId(managerId);
        List<ProjectResponse> responses = projects.stream()
                .map(this::convertToProjectResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("projects", responses));
    }

    /**
     * Hilfsmethode zur Überprüfung ob aktueller Benutzer Manager des Projekts ist
     * @param projectId Projekt-ID
     * @return true wenn Benutzer Manager des Projekts ist
     */
    public boolean isProjectManager(Long projectId) {
        // Diese Methode würde in einer echten Implementierung den aktuellen Benutzer
        // aus dem SecurityContext holen und prüfen ob er Manager des Projekts ist
        // Für jetzt als Platzhalter implementiert
        return true;
    }

    /**
     * Konvertiert ein Project-Objekt zu einem ProjectResponse-DTO
     * @param project Das zu konvertierende Project-Objekt
     * @return ProjectResponse-DTO
     */
    private ProjectResponse convertToProjectResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setActive(project.isActive());
        response.setCreatedAt(project.getCreatedAt());
        response.setUpdatedAt(project.getUpdatedAt());

        // Statistiken hinzufügen
        ProjectResponse.ProjectStatistics statistics = new ProjectResponse.ProjectStatistics();
        statistics.setActiveEmployees(projectService.countUsersByProjectId(project.getId()));
        statistics.setTotalTimeEntries(project.getTimeEntries().size());

        // Gesamtstunden berechnen (vereinfacht)
        String totalHours = project.getTimeEntries().stream()
                .mapToDouble(entry -> parseHoursFromString(entry.getActualHours()))
                .mapToInt(hours -> (int) Math.round(hours * 60))
                .mapToObj(minutes -> String.format("%02d:%02d", minutes / 60, minutes % 60))
                .reduce("00:00", (a, b) -> {
                    String[] aParts = a.split(":");
                    String[] bParts = b.split(":");
                    int totalMinutes = Integer.parseInt(aParts[0]) * 60 + Integer.parseInt(aParts[1]) +
                            Integer.parseInt(bParts[0]) * 60 + Integer.parseInt(bParts[1]);
                    return String.format("%02d:%02d", totalMinutes / 60, totalMinutes % 60);
                });

        statistics.setTotalHoursWorked(totalHours);
        response.setStatistics(statistics);

        return response;
    }

    /**
     * Hilfsmethode zum Parsen von Stunden aus String-Format
     * @param hoursString Stunden als String (Format: "HH:MM")
     * @return Stunden als Double
     */
    private double parseHoursFromString(String hoursString) {
        if (hoursString == null || hoursString.trim().isEmpty()) {
            return 0.0;
        }

        try {
            // Format: "HH:MM"
            String[] parts = hoursString.split(":");
            if (parts.length == 2) {
                int hours = Integer.parseInt(parts[0]);
                int minutes = Integer.parseInt(parts[1]);
                return hours + (minutes / 60.0);
            }
            return Double.parseDouble(hoursString);
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}

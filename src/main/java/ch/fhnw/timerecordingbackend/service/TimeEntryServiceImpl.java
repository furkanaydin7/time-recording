package ch.fhnw.timerecordingbackend.service;

import ch.fhnw.timerecordingbackend.dto.time.TimeEntryRequest;
import ch.fhnw.timerecordingbackend.dto.time.TimeEntryResponse;
import ch.fhnw.timerecordingbackend.model.Project;
import ch.fhnw.timerecordingbackend.model.TimeEntry;
import ch.fhnw.timerecordingbackend.model.User;
import ch.fhnw.timerecordingbackend.repository.ProjectRepository;
import ch.fhnw.timerecordingbackend.repository.TimeEntryRepository;
import ch.fhnw.timerecordingbackend.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service-Implementierung für Zeiterfassung und Zeiteintragsverwaltung
 * Stellt alle Funktionen für CRUD-Operationen und Start/Stopp-Tracking bereit
 * @author FA
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * Quelle: ChatGPT
 */
@Service
@Transactional
public class TimeEntryServiceImpl implements TimeEntryService {

    @Autowired
    private TimeEntryRepository timeEntryRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SecurityUtils securityUtils;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    public boolean isOwnerOfTimeEntry(Long timeEntryId) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            // Sollte nicht passieren, wenn @PreAuthorize("isAuthenticated()") vorher prüft,
            // aber als zusätzliche Sicherheit.
            return false;
        }
        // Prüfen, ob der Zeiteintrag existiert und dem aktuellen Benutzer gehört
        return timeEntryRepository.findById(timeEntryId)
                .map(timeEntry -> timeEntry.getUser().getId().equals(currentUser.getId()))
                .orElse(false); // Eintrag nicht gefunden, also kein Besitzer
    }

    @Override
    public TimeEntryResponse createTimeEntry(TimeEntryRequest request) {
        User currentUser = getCurrentUserOrThrow();

        // Prüfen, ob bereits ein Eintrag für das Datum existiert
        Optional<TimeEntry> existingEntry = timeEntryRepository.findByUserAndDate(currentUser, request.getDate());
        if (existingEntry.isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Für dieses Datum existiert bereits ein Zeiteintrag");
        }

        // Validierung der Zeitangaben
        validateTimeData(request);

        TimeEntry timeEntry = new TimeEntry();
        timeEntry.setUser(currentUser);
        timeEntry.setDate(request.getDate());

        // Start- und Endzeiten setzen
        setTimesFromRequest(timeEntry, request);

        // Pausen hinzufügen
        if (request.getBreaks() != null) {
            for (TimeEntryRequest.BreakTime breakTime : request.getBreaks()) {
                try {
                    LocalTime start = LocalTime.parse(breakTime.getStart(), TIME_FORMATTER);
                    LocalTime end = LocalTime.parse(breakTime.getEnd(), TIME_FORMATTER);
                    timeEntry.addBreak(start, end);
                } catch (DateTimeParseException e) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Ungültiges Pausenzeit-Format: " + e.getMessage());
                }
            }
        }

        // Arbeitszeiten berechnen
        calculateWorkingHours(timeEntry, currentUser);

        // Projekt zuweisen, falls vorhanden
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Projekt nicht gefunden"));
            timeEntry.setProject(project);
        }

        timeEntry.setCreatedAt(LocalDateTime.now());
        timeEntry.setUpdatedAt(LocalDateTime.now());

        TimeEntry savedEntry = timeEntryRepository.save(timeEntry);
        return convertToResponse(savedEntry);
    }

    @Override
    public void updateTimeEntry(Long id, TimeEntryRequest request) {
        User currentUser = getCurrentUserOrThrow();
        TimeEntry timeEntry = timeEntryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Zeiteintrag nicht gefunden"));

        // Berechtigung prüfen
        if (!timeEntry.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Sie können nur Ihre eigenen Zeiteinträge bearbeiten");
        }

        // Validierung der neuen Zeitangaben
        validateTimeData(request);

        // Zeiten aktualisieren
        timeEntry.getStartTimes().clear();
        timeEntry.getEndTimes().clear();
        timeEntry.getBreaks().clear();

        setTimesFromRequest(timeEntry, request);

        // Pausen hinzufügen
        if (request.getBreaks() != null) {
            for (TimeEntryRequest.BreakTime breakTime : request.getBreaks()) {
                try {
                    LocalTime start = LocalTime.parse(breakTime.getStart(), TIME_FORMATTER);
                    LocalTime end = LocalTime.parse(breakTime.getEnd(), TIME_FORMATTER);
                    timeEntry.addBreak(start, end);
                } catch (DateTimeParseException e) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Ungültiges Pausenzeit-Format: " + e.getMessage());
                }
            }
        }

        // Arbeitszeiten neu berechnen
        calculateWorkingHours(timeEntry, currentUser);

        // Projekt aktualisieren
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Projekt nicht gefunden"));
            timeEntry.setProject(project);
        } else {
            timeEntry.setProject(null);
        }

        timeEntry.setUpdatedAt(LocalDateTime.now());
        timeEntryRepository.save(timeEntry);
    }

    @Override
    public void deleteTimeEntry(Long id) {
        TimeEntry timeEntry = timeEntryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Zeiteintrag nicht gefunden"));

        timeEntryRepository.delete(timeEntry);
    }

    @Override
    public List<TimeEntryResponse> getCurrentUserTimeEntries() {
        User currentUser = getCurrentUserOrThrow();
        List<TimeEntry> entries = timeEntryRepository.findByUser(currentUser);
        return entries.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TimeEntryResponse> getUserTimeEntries(Long userId) {
        User user = securityUtils.getCurrentUser();
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nicht authentifiziert");
        }

        List<TimeEntry> entries = timeEntryRepository.findByUser(user);
        return entries.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> startTimeTracking(Long projectId) {
        User currentUser = getCurrentUserOrThrow();
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

         Optional<TimeEntry> existingEntry = timeEntryRepository.findByUserAndDate(currentUser, today);
        TimeEntry timeEntry;

        if (existingEntry.isPresent()) {
            timeEntry = existingEntry.get();
            // Prüfen, ob bereits eine Zeiterfassung läuft
            if (timeEntry.isActive()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Zeiterfassung läuft bereits");
            }
        } else {
            // Neuen Eintrag erstellen
            timeEntry = new TimeEntry();
            timeEntry.setUser(currentUser);
            timeEntry.setDate(today);
            timeEntry.setCreatedAt(LocalDateTime.now());
        }

        // Projekt zuweisen, falls angegeben
        if (projectId != null) {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Projekt nicht gefunden"));
            timeEntry.setProject(project);
        }

        // Startzeit hinzufügen
        timeEntry.addStartTime(now);
        timeEntry.setUpdatedAt(LocalDateTime.now());

        TimeEntry savedEntry = timeEntryRepository.save(timeEntry);

        Map<String, Object> response = new HashMap<>();
        response.put("entryId", savedEntry.getId());
        response.put("startTime", LocalDateTime.of(today, now).toString());
        response.put("message", "Zeiterfassung gestartet");

        return response;
    }

    @Override
    public Map<String, Object> stopTimeTracking(Long entryId) {
        User currentUser = getCurrentUserOrThrow();
        TimeEntry timeEntry = timeEntryRepository.findById(entryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Zeiteintrag nicht gefunden"));

        // Berechtigung prüfen
        if (!timeEntry.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Sie können nur Ihre eigenen Zeiteinträge stoppen");
        }

        // Prüfen, ob Zeiterfassung aktiv ist
        if (!timeEntry.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Keine aktive Zeiterfassung für diesen Eintrag");
        }

        LocalTime now = LocalTime.now();
        timeEntry.addEndTime(now);

        // Arbeitszeiten berechnen
        calculateWorkingHours(timeEntry, currentUser);
        timeEntry.setUpdatedAt(LocalDateTime.now());

        timeEntryRepository.save(timeEntry);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Zeiterfassung gestoppt");
        response.put("endTime", LocalDateTime.of(timeEntry.getDate(), now).toString());
        response.put("actualHours", timeEntry.getActualHours());

        return response;
    }

    @Override
    public void assignProject(Long timeEntryId, Long projectId) {
        TimeEntry timeEntry = timeEntryRepository.findById(timeEntryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Zeiteintrag nicht gefunden"));

        if (projectId != null) {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Projekt nicht gefunden"));
            timeEntry.setProject(project);
        } else {
            timeEntry.setProject(null);
        }

        timeEntry.setUpdatedAt(LocalDateTime.now());
        timeEntryRepository.save(timeEntry);
    }

    /**
     * Hilfsmethoden
     */

    private User getCurrentUserOrThrow() {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nicht authentifiziert");
        }
        return currentUser;
    }

    private void validateTimeData(TimeEntryRequest request) {
        if (request.getStartTimes() == null || request.getStartTimes().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Mindestens eine Startzeit ist erforderlich");
        }

        if (request.getEndTimes() == null || request.getEndTimes().size() > request.getStartTimes().size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Ungültige Anzahl von Endzeiten");
        }

        // Zeitformat validieren
        for (String timeStr : request.getStartTimes()) {
            try {
                LocalTime.parse(timeStr, TIME_FORMATTER);
            } catch (DateTimeParseException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Ungültiges Startzeit-Format: " + timeStr);
            }
        }

        for (String timeStr : request.getEndTimes()) {
            try {
                LocalTime.parse(timeStr, TIME_FORMATTER);
            } catch (DateTimeParseException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Ungültiges Endzeit-Format: " + timeStr);
            }
        }
    }

    private void setTimesFromRequest(TimeEntry timeEntry, TimeEntryRequest request) {
        // Startzeiten setzen
        for (String timeStr : request.getStartTimes()) {
            LocalTime time = LocalTime.parse(timeStr, TIME_FORMATTER);
            timeEntry.addStartTime(time);
        }

        // Endzeiten setzen
        for (String timeStr : request.getEndTimes()) {
            LocalTime time = LocalTime.parse(timeStr, TIME_FORMATTER);
            timeEntry.addEndTime(time);
        }
    }

    private void calculateWorkingHours(TimeEntry timeEntry, User user) {
        // Geplante Stunden pro Tag
        double plannedHoursPerDay = user.getPlannedHoursPerDay();

        // Tatsächliche Arbeitszeit berechnen
        double totalMinutes = 0;

        List<LocalTime> startTimes = new ArrayList<>(timeEntry.getStartTimes());
        List<LocalTime> endTimes = new ArrayList<>(timeEntry.getEndTimes());

        // Zeiten sortieren
        startTimes.sort(LocalTime::compareTo);
        endTimes.sort(LocalTime::compareTo);

        // Arbeitszeit zwischen Start- und Endzeiten berechnen
        int pairs = Math.min(startTimes.size(), endTimes.size());
        for (int i = 0; i < pairs; i++) {
            LocalTime start = startTimes.get(i);
            LocalTime end = endTimes.get(i);
            if (end.isAfter(start)) {
                totalMinutes += java.time.Duration.between(start, end).toMinutes();
            }
        }

        // Pausenzeiten abziehen
        for (TimeEntry.Break breakTime : timeEntry.getBreaks()) {
            if (breakTime.getEnd().isAfter(breakTime.getStart())) {
                totalMinutes -= java.time.Duration.between(breakTime.getStart(), breakTime.getEnd()).toMinutes();
            }
        }

        // In Stunden und Minuten formatieren
        long hours = (long) (totalMinutes / 60);
        long minutes = (long) (totalMinutes % 60);
        String actualHours = String.format("%02d:%02d", hours, minutes);

        // Geplante Stunden formatieren
        long plannedHours = (long) plannedHoursPerDay;
        long plannedMinutes = (long) ((plannedHoursPerDay - plannedHours) * 60);
        String plannedHoursStr = String.format("%02d:%02d", plannedHours, plannedMinutes);

        // Differenz berechnen
        double totalActualHours = totalMinutes / 60.0;
        double difference = totalActualHours - plannedHoursPerDay;
        long diffHours = (long) Math.abs(difference);
        long diffMinutes = (long) ((Math.abs(difference) - diffHours) * 60);
        String differenceStr = String.format("%s%02d:%02d",
                difference >= 0 ? "+" : "-", diffHours, diffMinutes);

        timeEntry.setActualHours(actualHours);
        timeEntry.setPlannedHours(plannedHoursStr);
        timeEntry.setDifference(differenceStr);
    }

    private TimeEntryResponse convertToResponse(TimeEntry timeEntry) {
        TimeEntryResponse response = new TimeEntryResponse();
        response.setId(timeEntry.getId());
        response.setDate(timeEntry.getDate());
        response.setActualHours(timeEntry.getActualHours());
        response.setPlannedHours(timeEntry.getPlannedHours());
        response.setDifference(timeEntry.getDifference());
        response.setUserId(timeEntry.getUser().getId());
        response.setUser(timeEntry.getUser().getFirstName() + " " + timeEntry.getUser().getLastName());

        // Start- und Endzeiten konvertieren
        List<String> startTimes = timeEntry.getStartTimes().stream()
                .sorted()
                .map(time -> time.format(TIME_FORMATTER))
                .collect(Collectors.toList());
        response.setStartTimes(startTimes);

        List<String> endTimes = timeEntry.getEndTimes().stream()
                .sorted()
                .map(time -> time.format(TIME_FORMATTER))
                .collect(Collectors.toList());
        response.setEndTimes(endTimes);

        // Pausen konvertieren
        List<TimeEntryResponse.BreakTime> breaks = timeEntry.getBreaks().stream()
                .map(breakTime -> {
                    TimeEntryResponse.BreakTime bt = new TimeEntryResponse.BreakTime();
                    bt.setStart(breakTime.getStart().format(TIME_FORMATTER));
                    bt.setEnd(breakTime.getEnd().format(TIME_FORMATTER));
                    return bt;
                })
                .collect(Collectors.toList());
        response.setBreaks(breaks);

        // Projekt hinzufügen, falls vorhanden
        if (timeEntry.getProject() != null) {
            response.setProject(new TimeEntryResponse.ProjectDto(
                    timeEntry.getProject().getId(),
                    timeEntry.getProject().getName()
            ));
        }

        return response;
    }
}
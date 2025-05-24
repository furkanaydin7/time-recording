package ch.fhnw.timerecordingbackend.service;

import ch.fhnw.timerecordingbackend.model.Absence;
import ch.fhnw.timerecordingbackend.model.SystemLog;
import ch.fhnw.timerecordingbackend.model.User;
import ch.fhnw.timerecordingbackend.model.enums.AbsenceType;
import ch.fhnw.timerecordingbackend.repository.AbsenceRepository;
import ch.fhnw.timerecordingbackend.repository.SystemLogRepository;
import ch.fhnw.timerecordingbackend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Implementierung AbsenceService Interface
 * @author PD
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */
@Service
public class AbsenceServiceImpl implements AbsenceService{

    private final AbsenceRepository absenceRepository;
    private final UserRepository userRepository;
    private final SystemLogRepository systemLogRepository;

    @Autowired
    public AbsenceServiceImpl(
            AbsenceRepository absenceRepository,
            UserRepository userRepository,
            SystemLogRepository systemLogRepository) {
        this.absenceRepository = absenceRepository;
        this.userRepository = userRepository;
        this.systemLogRepository = systemLogRepository;
    }

    @Override
    public List<Absence> findAllAbsences() {
        return absenceRepository.findAll();
    }

    @Override
    public Optional<Absence> findById(Long id) {
        return absenceRepository.findById(id);
    }

    @Override
    public List<Absence> findByUser(User user) {
        return absenceRepository.findByUser(user);
    }

    @Override
    public List<Absence> findByType(AbsenceType type) {
        return absenceRepository.findByType(type);
    }

    @Override
    public List<Absence> findByUserAndType(User user, AbsenceType type) {
        return absenceRepository.findByUserAndType(user, type);
    }

    /**
     * Abwesenheit erstellen
     * @param absence
     * @return
     */
    @Override
    @Transactional
    public Absence createAbsence(Absence absence) {
        // Validieren Abwesenheit
        if (!isValidAbsence(absence)) {
            throw new IllegalArgumentException("Ungültige Abwesenheit");
        }

        // Prüfung auf überlappende Abwesenheiten
        if (hasOverlappingAbsences(absence.getUser().getId(), absence.getStartDate(), absence.getEndDate(), null)) {
            throw new IllegalArgumentException("Die Abwesenheit überschneidet sich mit einer bestehenden Abwesenheit");
        }

        // Zeitstempel setzen
        LocalDateTime now = LocalDateTime.now();
        absence.setCreatedAt(now);
        absence.setUpdatedAt(now);

        // Abwesenheit speichern
        Absence savedAbsence = absenceRepository.save(absence);

        // Log erstellen
        createSystemLog("Abwesenheit erstellt für " + absence.getUser().getFullName(),
                "Abwesenheit ID: " + savedAbsence.getId() + ", Typ: " + absence.getType().getDisplayName() +
                        ", Zeitraum: " + absence.getStartDate() + " bis " + absence.getEndDate());

        return savedAbsence;
    }

    /**
     * Abwesenheit aktualisieren
     * @param id
     * @param updatedAbsence
     * @return
     */
    @Override
    @Transactional
    public Absence updateAbsence(Long id, Absence updatedAbsence) {
        // Abwesenheit finden
        Absence existingAbsence = absenceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Abwesenheit nicht vorhanden"));

        // Validieren der Abwesenheit
        if (!isValidAbsence(updatedAbsence)) {
            throw new IllegalArgumentException("Ungültige Abwesenheit");
        }

        // Prüfung auf überlappende Abwesenheiten
        if (hasOverlappingAbsences(updatedAbsence.getUser().getId(),
                updatedAbsence.getStartDate(),
                updatedAbsence.getEndDate(), id)) {
            throw new IllegalArgumentException("Die Abwesenheit überschneidet sich mit einer bestehenden Abwesenheit");
        }

        // Abwesenheit aktualisieren
        existingAbsence.setStartDate(updatedAbsence.getStartDate());
        existingAbsence.setEndDate(updatedAbsence.getEndDate());
        existingAbsence.setType(updatedAbsence.getType());
        existingAbsence.setUpdatedAt(LocalDateTime.now());

        Absence savedAbsence = absenceRepository.save(existingAbsence);

        // Log erstellen
        createSystemLog("Abwesenheit aktualisiert für " + existingAbsence.getUser().getFullName(),
                "Abwesenheit ID: " + existingAbsence.getId());

        return savedAbsence;
    }

    /**
     * Abwesenheit löschen
     * @param id
     */
    @Override
    @Transactional
    public void deleteAbsence(Long id) {
        // Abwesenheit finden
        Absence absence = absenceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Abwesenheit nicht vorhanden"));


        String userName = absence.getUser().getFullName();
        String absenceDetails = "Typ: " + absence.getType().getDisplayName() +
                ", Zeitraum: " + absence.getStartDate() + " bis " + absence.getEndDate();

        // Abwesenheit löschen
        absenceRepository.delete(absence);

        // Log erstellen
        createSystemLog("Abwesenheit gelöscht für " + userName,
                "Abwesenheit ID: " + id + ", " + absenceDetails);
    }

    /**
     * Abwesenheit genehmigen
     * @param id
     * @param approverId
     * @return
     */
    @Override
    @Transactional
    public Absence approveAbsence(Long id, Long approverId) {
        // Abwesenheit finden
        Absence absence = absenceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Abwesenheit nicht vorhanden"));

        // Genehmiger finden
        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new IllegalArgumentException("Genehmiger nicht vorhanden"));

        // Prüfen, ob der Genehmiger berechtigt ist
        if (!approver.hasRole("ADMIN") && !approver.hasRole("MANAGER")) {
            throw new IllegalArgumentException("Benutzer hat keine Berechtigung zur Genehmigung von Abwesenheiten");
        }

        // Abwesenheit genehmigen
        absence.approve(approver);
        Absence approvedAbsence = absenceRepository.save(absence);

        // Log erstellen
        createSystemLog("Abwesenheit genehmigt für " + absence.getUser().getFullName() +
                        " von " + approver.getFullName(),
                "Abwesenheit ID: " + absence.getId());

        return approvedAbsence;
    }

    @Override
    @Transactional
    public Absence rejectAbsence(Long id) {
        // Abwesenheit finden
        Absence absence = absenceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Abwesenheit nicht vorhanden"));

        // Abwesenheit ablehnen
        absence.reject();
        absence.setUpdatedAt(LocalDateTime.now());
        Absence rejectedAbsence = absenceRepository.save(absence);

        // Log erstellen
        createSystemLog("Abwesenheit abgelehnt für " + absence.getUser().getFullName(),
                "Abwesenheit ID: " + absence.getId());

        return rejectedAbsence;
    }

    @Override
    public List<Absence> findApprovedAbsences() {
        return absenceRepository.findByApprovedTrue();
    }

    @Override
    public List<Absence> findPendingAbsences() {
        return absenceRepository.findByApprovedFalse();
    }

    @Override
    public List<Absence> findApprovedAbsencesByUser(User user) {
        return absenceRepository.findByUserAndApprovedTrue(user);
    }

    @Override
    public List<Absence> findPendingAbsencesByUser(User user) {
        return absenceRepository.findByUserAndApprovedFalse(user);
    }

    @Override
    public boolean hasApprovedAbsenceOnDate(Long userId, LocalDate date) {
        return absenceRepository.hasApprovedAbsenceOnDate(userId, date);
    }

    @Override
    public Long sumAbsenceDaysByUserIdAndTypeAndDateRange(Long userId, AbsenceType type,
                                                          LocalDate startDate, LocalDate endDate) {
        return absenceRepository.sumAbsenceDaysByUserIdAndTypeAndDateRange(userId, type, startDate, endDate);
    }

    @Override
    public List<Absence> findCurrentAndFutureAbsencesByUserId(Long userId, LocalDate today) {
        return absenceRepository.findCurrentAndFutureAbsencesByUserId(userId, today);
    }

    /**
     * Abwesenheit validieren
     * @param absence
     * @return
     */
    @Override
    public boolean isValidAbsence(Absence absence) {
        // Validierungen
        if (absence == null || absence.getUser() == null ||
                absence.getStartDate() == null || absence.getEndDate() == null ||
                absence.getType() == null) {
            return false;
        }

        // Enddatum muss nach oder gleich Startdatum sein
        if (absence.getEndDate().isBefore(absence.getStartDate())) {
            return false;
        }

        // Abwesenheit darf nicht in der Vergangenheit liegen
        if (absence.getId() == null && absence.getStartDate().isBefore(LocalDate.now())) {
            return false;
        }

        // Maximale Abwesenheitsdauer 60 Tage
        if (absence.getDurationInDays() > 60) {
            return false;
        }

        return true;
    }

    /**
     * Überlappung bei Abwesenheiten
     * @param userId
     * @param startDate
     * @param endDate
     * @param excludeId
     * @return
     */
    @Override
    public boolean hasOverlappingAbsences(Long userId, LocalDate startDate, LocalDate endDate, Long excludeId) {
        // Alle Abwesenheiten eines Benutzers abrufen
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Benutzer nicht vorhanden"));

        List<Absence> existingAbsences = absenceRepository.findByUser(user);

        // Prüfung auf Überschneidung
        for (Absence existing : existingAbsences) {
            // Aktuelle Abwesenheit ausschliessen
            if (excludeId != null && existing.getId().equals(excludeId)) {
                continue;
            }

            // Prüfung auf Überschneidung
            if (!(endDate.isBefore(existing.getStartDate()) ||
                    startDate.isAfter(existing.getEndDate()))) {
                return true; // Überschneidung gefunden
            }
        }

        return false; // Keine Überschneidung
    }

    /**
     * Erstellen von Systemlogs
     * @param action
     * @param details
     */
    private void createSystemLog(String action, String details) {
        SystemLog log = new SystemLog();
        log.setAction(action);
        log.setTimestamp(LocalDateTime.now());
        log.setDetails(details);
        systemLogRepository.save(log);
    }
}

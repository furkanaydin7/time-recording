package ch.fhnw.timerecordingbackend.service;

import ch.fhnw.timerecordingbackend.model.Absence;
import ch.fhnw.timerecordingbackend.model.User;
import ch.fhnw.timerecordingbackend.model.enums.AbsenceType;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AbsenceService {

    List<Absence> findAllAbsences();
    Optional<Absence> findById(Long id);
    List<Absence> findByUser(User user);
    List<Absence> findByType(AbsenceType type);
    List<Absence> findByUserAndType(User user, AbsenceType type);

    Absence createAbsence(Absence absence);
    Absence updateAbsence(Long id, Absence updatedAbsence);
    void deleteAbsence(Long id);

    Absence approveAbsence(Long id, Long approverId);
    Absence rejectAbsence(Long id);

    List<Absence> findApprovedAbsences();
    List<Absence> findPendingAbsences();
    List<Absence> findApprovedAbsencesByUser(User user);
    List<Absence> findPendingAbsencesByUser(User user);

    boolean hasApprovedAbsenceOnDate(Long userId, LocalDate date);
    Long sumAbsenceDaysByUserIdAndTypeAndDateRange(Long userId, AbsenceType type, LocalDate startDate, LocalDate endDate);
    List<Absence> findCurrentAndFutureAbsencesByUserId(Long userId, LocalDate today);

    boolean isValidAbsence(Absence absence);
    boolean hasOverlappingAbsences(Long userId, LocalDate startDate, LocalDate endDate, Long excludeId);
}
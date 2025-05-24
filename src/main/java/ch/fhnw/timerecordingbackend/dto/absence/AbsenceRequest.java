package ch.fhnw.timerecordingbackend.dto.absence;

import ch.fhnw.timerecordingbackend.model.enums.AbsenceType;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * DTO Anfragen zum erstellen und aktualisieren von Abwesenheiten
 * @author PD
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 * Quelle: https://medium.com/paysafe-bulgaria/springboot-dto-validation-good-practices-and-breakdown-fee69277b3b0
 */
public class AbsenceRequest {

    @NotNull(message = "Startdatum darf nicht null sein")
    private LocalDate startDate;

    @NotNull(message = "Enddatum darf nicht null sein")
    private LocalDate endDate;

    @NotNull(message = "Typ darf nicht null sein")
    private AbsenceType type;

    /**
     * Konstruktoren
     */
    public AbsenceRequest() {}

    public AbsenceRequest(LocalDate startDate, LocalDate endDate, AbsenceType type) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.type = type;
    }

    /**
     * Prüfen ob Startdatum vor Enddatum
     */
    public boolean isDateRangeValid() {
        return startDate.isBefore(endDate);
    }

    /**
     * Abwesenheit in Tagen berechnen
     */
    public long getDurationInDays() {
        return startDate.datesUntil(endDate.plusDays(1)).count();
    }

    /**
     * Getter und Setter
     */
    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public AbsenceType getType() {
        return type;
    }

    public void setType(AbsenceType type) {
        this.type = type;
    }

    @Override
    public String toString() {
        return "AbsenceRequest{" +
                "startDate=" + startDate +
                ", endDate=" + endDate +
                ", type=" + type +
                ", durationInDays=" + getDurationInDays() +
                '}';
    }
}

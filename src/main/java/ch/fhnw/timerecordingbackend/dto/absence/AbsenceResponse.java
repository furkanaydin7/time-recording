package ch.fhnw.timerecordingbackend.dto.absence;

import ch.fhnw.timerecordingbackend.model.enums.AbsenceType;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO Antwort für Abwesenheiten Anfragen
 * @author PD
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 * Quelle: https://techkluster.com/2023/08/21/dto-for-a-java-spring-application/
 */
public class AbsenceResponse {

    private Long id;
    private LocalDate startDate;
    private LocalDate endDate;
    private AbsenceType type;
    private boolean approved;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;

    //User Informationen
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;

    /**
     * Konstruktor
     */
    public AbsenceResponse() {}

    public AbsenceResponse(Long id, LocalDate startDate, LocalDate endDate, AbsenceType type, boolean approved) {
        this.id = id;
        this.startDate = startDate;
        this.endDate = endDate;
        this.type = type;
        this.approved = approved;
    }

    /**
     * Vollständiger Namen des Users
     * @return vollständiger Name
     */
    public String getUserFullName() {
        return firstName + " " + lastName;
    }

    /**
     * Dauer der Abweseheit berechnen
     */
    public long getDurationInDays() {
        if (startDate == null || endDate == null) {
            return 0;
        }
        return startDate.datesUntil(endDate.plusDays(1)).count();
    }

    /**
     * Name des Abwesenheits Typ ausgeben
     */
    public String getTypeDisplayName() {
        return type.getDisplayName();
    }

    /**
     * Getter und Setter
     */
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public String toString() {
        return "AbsenceResponse{" +
                "id=" + id +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", type=" + type +
                ", approved=" + approved +
                ", userFullName='" + getUserFullName() + '\'' +
                ", durationInDays=" + getDurationInDays() +
                '}';
    }
}


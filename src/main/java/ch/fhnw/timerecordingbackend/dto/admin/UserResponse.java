package ch.fhnw.timerecordingbackend.dto.admin;

import ch.fhnw.timerecordingbackend.model.enums.UserStatus;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO für Benutzer-Antwortobjekte
 * Benutzerinformationen an Client senden
 * @author PD
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 * Quelle: https://techkluster.com/2023/08/21/dto-for-a-java-spring-application/
 */
public class UserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private boolean active;
    private UserStatus status;
    private double plannedHoursPerDay;
    private Set<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Getter und Setter
     */

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public double getPlannedHoursPerDay() {
        return plannedHoursPerDay;
    }

    public void setPlannedHoursPerDay(double plannedHoursPerDay) {
        this.plannedHoursPerDay = plannedHoursPerDay;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
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

    @Override
    public String toString() {
        return "UserResponse{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", active=" + active +
                ", status=" + status +
                ", plannedHoursPerDay=" + plannedHoursPerDay +
                ", roles=" + roles +
                ", createdAt='" + createdAt + '\'' +
                ", updatedAt='" + updatedAt + '\'' +
                '}';
    }
}

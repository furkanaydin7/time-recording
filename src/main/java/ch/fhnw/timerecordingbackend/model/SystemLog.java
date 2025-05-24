package ch.fhnw.timerecordingbackend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Entität Klasse für System Logs
 * @author PD
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */
@Entity
@Table(name = "system_logs")
public class SystemLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(length = 1000)
    private String details;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_email", length = 100)
    private String userEmail;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "target_entity", length = 50)
    private String targetEntity;

    @Column(name = "target_id")
    private Long targetId;

    /**
     * Konstruktor
     */
    public SystemLog() {}

    public SystemLog(String action, LocalDateTime timestamp) {
        this.action = action;
        this.timestamp = timestamp;
    }

    public SystemLog(String action, LocalDateTime timestamp, String details, Long userId,
                     String userEmail, String ipAddress, String targetEntity, Long targetId) {
        this.action = action;
        this.timestamp = timestamp;
        this.details = details;
        this.userId = userId;
        this.userEmail = userEmail;
        this.ipAddress = ipAddress;
        this.targetEntity = targetEntity;
        this.targetId = targetId;
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

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getTargetEntity() {
        return targetEntity;
    }

    public void setTargetEntity(String targetEntity) {
        this.targetEntity = targetEntity;
    }

    public Long getTargetId() {
        return targetId;
    }

    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    @Override
    public String toString() {
        return "SystemLog{" +
                "id=" + id +
                ", action='" + action + '\'' +
                ", timestamp=" + timestamp +
                ", details='" + details + '\'' +
                ", userId=" + userId +
                ", userEmail='" + userEmail + '\'' +
                '}';
    }

}

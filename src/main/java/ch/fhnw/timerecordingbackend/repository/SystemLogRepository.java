package ch.fhnw.timerecordingbackend.repository;

import ch.fhnw.timerecordingbackend.model.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {

    List<SystemLog> findByUserId(Long userId);
    List<SystemLog> findByUserEmail(String email);
    List<SystemLog> findByActionContaining(String action);
    List<SystemLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    List<SystemLog> findByTargetEntityAndTargetId(String targetEntity, Long targetId);

    @Query("SELECT l FROM SystemLog l WHERE LOWER(l.action) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(l.details) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<SystemLog> searchLogs(@Param("searchTerm") String searchTerm);

    List<SystemLog> findByUserIdAndTimestampBetween(Long userId, LocalDateTime start, LocalDateTime end);
    long deleteByTimestampBefore(LocalDateTime timestamp);

    List<SystemLog> findByUserIdAndActionAndProcessedStatusIsNullOrderByTimestampDesc(Long userId, String action);

    List<SystemLog> findByUserIdAndActionOrderByTimestampDesc(Long userId, String action);
    List<SystemLog> findByUserIdOrderByTimestampDesc(Long userId);
    List<SystemLog> findByUserIdAndActionAndProcessedStatusOrderByTimestampDesc(Long userId, String action, String processedStatus);
}
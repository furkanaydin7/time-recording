package ch.fhnw.timerecordingbackend.repository;

import ch.fhnw.timerecordingbackend.model.Absence;
import ch.fhnw.timerecordingbackend.model.User;
import ch.fhnw.timerecordingbackend.model.enums.AbsenceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository für Absence Entitäten
 * @author PD
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */
public interface AbsenceRepository extends JpaRepository<Absence, Long> {

    /**
     * Liefert alle Abwesenheiten eines Benutzers zurück.
     * @param user
     * @return Liste mit Abwesenheiten eines Benutzers.
     */
    List<Absence> findByUser(User user);

    /**
     * Liefert alle Abwesenheiten eines bestimmten Typs zurück.
     * @param type
     * @return Liste mit Abwesenheiten eines bestimmten Typs.
     */
    List<Absence> findByType(AbsenceType type);

    /**
     * Liefert alle Abwesenheiten eines Benutzers eines bestimmten Typs zurück.
     * @param user
     * @param type
     * @return Liste mit Abwesenheiten eines Benutzers eines bestimmten Typs.
     */
    List<Absence> findByUserAndType(User user, AbsenceType type);

    /**
     * Liefert alle genehmigten Abwesenheiten zurück.
     * @return Liste mit genehmigten Abwesenheiten.
     */
    List<Absence> findByApprovedTrue();

    /**
     * Liefert alle nicht genehmigten Abwesenheiten zurück.
     * @return Liste mit nicht genehmigten Abwesenheiten.
     */
    List<Absence> findByApprovedFalse();

    /**
     * Liefert alle genehmigten und nicht genehmigten Abwesenheiten eines Benutzers zurück.
     * @param user
     * @return Liste mit genehmigten und nicht genehmigten Abwesenheiten eines Benutzers.
     */
    List<Absence> findByUserAndApprovedTrue(User user);

    /**
     * Liefert alle nicht genehmigten Abwesenheiten eines Benutzers zurück.
     * @param user
     * @return Liste mit nicht genehmigten Abwesenheiten eines Benutzers.
     */
    List<Absence> findByUserAndApprovedFalse(User user);

    /**
     * Überprüft ob ein Benutzer einen bestimmten Tag abwesend war.
     * @param userId
     * @param date
     * @return true, wenn der Benutzer einen bestimmten Tag abwesend war, sonst false
     * Quelle: ChatGPT.com
     */
    @Query("SELECT COUNT(a) > 0 FROM Absence a WHERE a.user.id = :userId AND :date BETWEEN a.startDate AND a.endDate AND a.approved = true")
    boolean hasApprovedAbsenceOnDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    /**
     * Summe der genehmigten Abwesenheiten eines Benutzers für einen bestimmten Zeitraum zurück.
     * @param userId
     * @param type
     * @param startDate
     * @param endDate
     * @return Long mit der Summe der genehmigten Abwesenheiten eines Benutzers für einen bestimmten Zeitraum.
     * Quelle: ChatGPT.com
     */
    @Query(
            value = "SELECT SUM(DATEDIFF('DAY', a.start_date, a.end_date)) " +
                    "FROM absence a " +
                    "WHERE a.user_id   = :userId " +
                    "AND a.type      = :type " +
                    "AND a.start_date >= :from " +
                    "AND a.end_date   <= :to",
            nativeQuery = true
    )
    Long sumAbsenceDaysByUserIdAndTypeAndDateRange(
            @Param("userId") Long userId,
            @Param("type")   AbsenceType type,
            @Param("from")   LocalDate from,
            @Param("to")     LocalDate to
    );

    /**
     * Liefert alle aktuellen und zukünftigen Abwesenheiten eines Benutzers zurück.
     * @param userId
     * @param today
     * @return Liste mit aktuellen und zukünftigen Abwesenheiten eines Benutzers.
     * Quelle: ChatGPT.com
     */
    @Query("SELECT a FROM Absence a WHERE a.user.id = :userId AND a.endDate >= :today ORDER BY a.startDate ASC")
    List<Absence> findCurrentAndFutureAbsencesByUserId(@Param("userId") Long userId, @Param("today") LocalDate today);

}

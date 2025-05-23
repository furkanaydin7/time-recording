package ch.fhnw.timerecordingbackend.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

/**
 * Anfrageobjekt für das Erstellen oder Aktualisieren eines Zeiteintrags
 * Enthält Datum, Start-/Endzeiten, optionale Pausen und Projekt-ID
 * @author FA
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 */
public class TimeEntryRequest {

    @NotNull
    private LocalDate date;

    @NotNull
    private List<String> startTimes;

    @NotNull
    private List<String> endTimes;

    private List<BreakTime> breaks;

    private Long projectId;

    // Getter und Setter
    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public List<String> getStartTimes() {
        return startTimes;
    }

    public void setStartTimes(List<String> startTimes) {
        this.startTimes = startTimes;
    }

    public List<String> getEndTimes() {
        return endTimes;
    }

    public void setEndTimes(List<String> endTimes) {
        this.endTimes = endTimes;
    }

    public List<BreakTime> getBreaks() {
        return breaks;
    }

    public void setBreaks(List<BreakTime> breaks) {
        this.breaks = breaks;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    /**
     * Innere statische Klasse zur Darstellung einer Pause innerhalb eines Zeiteintrags
     * Jede Pause besteht aus einem Start- und einem Endzeitpunkt (Format: HH:mm)
     */
    public static class BreakTime {
        private String start;
        private String end;

        // Getter und Setter
        public String getStart() {
            return start;
        }

        public void setStart(String start) {
            this.start = start;
        }

        public String getEnd() {
            return end;
        }

        public void setEnd(String end) {
            this.end = end;
        }
    }
}

package ch.fhnw.timerecordingbackend.dto;

import java.time.LocalDate;
import java.util.List;

public class TimeEntryRequest {
    private LocalDate date;
    private List<String> startTimes;
    private List<String> endTimes;
    private List<BreakTime> breaks;
    private Long projectId;

    // Getters and setters
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

    public static class BreakTime {
        private String start;
        private String end;

        // Getters and setters
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

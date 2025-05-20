package ch.fhnw.timerecordingbackend.dto;

import java.time.LocalDate;
import java.util.List;

public class TimeEntryResponse {
    private Long id;
    private LocalDate date;
    private List<String> startTimes;
    private List<String> endTimes;
    private List<BreakTime> breaks;
    private String actualHours;
    private String plannedHours;
    private String difference;
    private ProjectDto project;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getActualHours() {
        return actualHours;
    }

    public void setActualHours(String actualHours) {
        this.actualHours = actualHours;
    }

    public String getPlannedHours() {
        return plannedHours;
    }

    public void setPlannedHours(String plannedHours) {
        this.plannedHours = plannedHours;
    }

    public String getDifference() {
        return difference;
    }

    public void setDifference(String difference) {
        this.difference = difference;
    }

    public ProjectDto getProject() {
        return project;
    }

    public void setProject(ProjectDto project) {
        this.project = project;
    }

    // Inner classes
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

    public static class ProjectDto {
        private Long id;
        private String name;

        public ProjectDto(Long id, String name) {
            this.id = id;
            this.name = name;
        }

        // Getters
        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }
    }
}

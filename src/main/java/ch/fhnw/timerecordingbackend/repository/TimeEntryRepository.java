package ch.fhnw.timerecordingbackend.repository;

import ch.fhnw.timerecordingbackend.model.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {
}

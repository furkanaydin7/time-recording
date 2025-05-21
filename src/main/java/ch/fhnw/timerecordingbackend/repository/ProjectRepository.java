package ch.fhnw.timerecordingbackend.repository;

import ch.fhnw.timerecordingbackend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
}

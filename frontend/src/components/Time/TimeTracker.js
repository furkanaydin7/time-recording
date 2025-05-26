import React, { useState, useEffect } from 'react';
import { useTimeEntries } from '../../contexts/TimeEntryContext';
import { useProjects } from '../../contexts/ProjectContext';
import Button from '../common/Button';
import Card from '../common/Card';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const TimeTracker = () => {
    const { startTimeTracking, stopTimeTracking, getActiveEntry } = useTimeEntries();
    const { projects } = useProjects();
    const [activeEntry, setActiveEntry] = useState(null);
    const [selectedProject, setSelectedProject] = useState('');
    const [elapsedTime, setElapsedTime] = useState('00:00:00');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchActiveEntry = async () => {
            const active = await getActiveEntry();
            setActiveEntry(active);
        };

        fetchActiveEntry();
    }, [getActiveEntry]);

    useEffect(() => {
        let interval;

        if (activeEntry) {
            interval = setInterval(() => {
                const startTime = new Date(`${activeEntry.date}T${activeEntry.startTimes[activeEntry.startTimes.length - 1]}`);
                const now = new Date();
                const diff = now - startTime;

                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                setElapsedTime(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeEntry]);

    const handleStart = async () => {
        setLoading(true);
        try {
            const entry = await startTimeTracking(selectedProject || null);
            setActiveEntry(entry);
        } catch (error) {
            console.error('Fehler beim Starten der Zeiterfassung:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        if (!activeEntry) return;

        setLoading(true);
        try {
            await stopTimeTracking(activeEntry.id);
            setActiveEntry(null);
            setElapsedTime('00:00:00');
        } catch (error) {
            console.error('Fehler beim Stoppen der Zeiterfassung:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Zeittracker">
            <div className="time-tracker">
                <div className="tracker-display">
                    <div className="elapsed-time">{elapsedTime}</div>
                    <div className="tracker-status">
                        {activeEntry ? 'Läuft seit ' + new Date(`${activeEntry.date}T${activeEntry.startTimes[activeEntry.startTimes.length - 1]}`).toLocaleTimeString('de-DE') : 'Nicht aktiv'}
                    </div>
                </div>

                {!activeEntry && (
                    <div className="project-selection">
                        <label className="form-label">Projekt (optional)</label>
                        <select
                            className="form-input"
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                        >
                            <option value="">Kein Projekt</option>
                            {projects?.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="tracker-actions">
                    {activeEntry ? (
                        <Button
                            variant="danger"
                            onClick={handleStop}
                            loading={loading}
                        >
                            Stoppen
                        </Button>
                    ) : (
                        <Button
                            variant="success"
                            onClick={handleStart}
                            loading={loading}
                        >
                            Starten
                        </Button>
                    )}
                </div>

                {activeEntry?.project && (
                    <div className="active-project">
                        Aktuelles Projekt: {activeEntry.project.name}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default TimeTracker;
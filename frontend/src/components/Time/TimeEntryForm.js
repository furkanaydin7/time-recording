
import React, { useState, useEffect } from 'react'; // useEffect importieren
import { useTimeEntries } from '../../contexts/TimeEntryContext';
import { useProjects } from '../../contexts/ProjectContext'; // Sicherstellen, dass Projekte geladen werden können
import Button from '../common/Button';
import DatePicker from '../common/DatePicker';
import TimePicker from '../common/TimePicker';
import Card from '../common/Card';

/**
 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.1 - Hinzugefügt useEffect zur korrekten Initialisierung beim Bearbeiten, Sicherstellung der Projektzuweisung
 */

const TimeEntryForm = ({ entry = null, onSuccess }) => {
    const { createTimeEntry, updateTimeEntry } = useTimeEntries();
    const { projects } = useProjects(); // Projekte für das Dropdown laden

    // Initialer State für formData, wird verwendet, wenn kein 'entry' übergeben wird (Neuerstellung)
    // oder um das Formular zurückzusetzen.
    const initialFormData = {
        date: new Date().toISOString().split('T')[0],
        startTimes: [''],
        endTimes: [''],
        breaks: [], // Pausen als Array von Objekten { start: '', end: '' }
        projectId: '' // Wichtig für die Projektzuweisung
    };

    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!entry; // Bestimmt, ob das Formular zum Bearbeiten oder Erstellen dient

    // Effekt zum Aktualisieren des Formulars, wenn sich das 'entry'-Prop ändert (z.B. wenn ein anderer Eintrag zum Bearbeiten ausgewählt wird)
    useEffect(() => {
        if (entry && isEditing) { // Nur ausführen, wenn ein Eintrag zum Bearbeiten vorhanden ist
            setFormData({
                date: entry.date || new Date().toISOString().split('T')[0],
                // Sicherstellen, dass Zeiten im HH:mm Format sind und leere Arrays korrekt behandelt werden
                startTimes: entry.startTimes && entry.startTimes.length > 0
                    ? entry.startTimes.map(t => t ? t.substring(0,5) : '')
                    : [''],
                endTimes: entry.endTimes && entry.endTimes.length > 0
                    ? entry.endTimes.map(t => t ? t.substring(0,5) : '')
                    : [''],
                breaks: entry.breaks
                    ? entry.breaks.map(b => ({
                        start: b && b.start ? b.start.substring(0,5) : '',
                        end: b && b.end ? b.end.substring(0,5) : ''
                    }))
                    : [],
                projectId: entry.project?.id || '' // Projekt-ID aus dem Eintrag übernehmen
            });
        } else {
            // Formular für einen neuen Eintrag zurücksetzen
            setFormData(initialFormData);
        }
    }, [entry, isEditing]); // Abhängigkeiten: Effekt erneut ausführen, wenn 'entry' oder 'isEditing' sich ändern

    // Handler zum Hinzufügen eines neuen Arbeitszeit-Slots
    const handleAddTimeSlot = () => {
        setFormData(prev => ({
            ...prev,
            startTimes: [...prev.startTimes, ''],
            endTimes: [...prev.endTimes, '']
        }));
    };

    // Handler zum Entfernen eines Arbeitszeit-Slots
    const handleRemoveTimeSlot = (index) => {
        setFormData(prev => ({
            ...prev,
            startTimes: prev.startTimes.filter((_, i) => i !== index),
            endTimes: prev.endTimes.filter((_, i) => i !== index)
        }));
    };

    // Handler für Änderungen in den Zeitfeldern (Start/Ende)
    const handleTimeChange = (type, index, value) => {
        const newTimes = [...formData[type]];
        newTimes[index] = value;
        setFormData(prev => ({
            ...prev,
            [type]: newTimes
        }));
    };

    // Handler zum Hinzufügen einer neuen Pause
    const handleAddBreak = () => {
        setFormData(prev => ({
            ...prev,
            breaks: [...prev.breaks, { start: '', end: '' }]
        }));
    };

    // Handler zum Entfernen einer Pause
    const handleRemoveBreak = (index) => {
        setFormData(prev => ({
            ...prev,
            breaks: prev.breaks.filter((_, i) => i !== index)
        }));
    };

    // Handler für Änderungen in den Pausenzeitfeldern
    const handleBreakChange = (index, field, value) => {
        const newBreaks = [...formData.breaks];
        newBreaks[index] = { ...newBreaks[index], [field]: value };
        setFormData(prev => ({
            ...prev,
            breaks: newBreaks
        }));
    };

    // Handler zum Absenden des Formulars
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Daten für das Backend vorbereiten
            const timeEntryData = {
                date: formData.date,
                // Leere oder ungültige Zeit-Strings herausfiltern
                startTimes: (formData.startTimes || []).filter(t => t && t.trim().match(/^\d{2}:\d{2}$/)),
                endTimes: (formData.endTimes || []).filter(t => t && t.trim().match(/^\d{2}:\d{2}$/)),
                // Nur vollständige Pausen mit validem Format senden
                breaks: (formData.breaks || []).filter(b =>
                    b.start && b.start.trim().match(/^\d{2}:\d{2}$/) &&
                    b.end && b.end.trim().match(/^\d{2}:\d{2}$/)
                ),
                projectId: formData.projectId || null // projectId kann null sein, wenn kein Projekt ausgewählt ist
            };

            // Validierung der Zeiteingaben
            if (timeEntryData.startTimes.length === 0) {
                throw new Error('Bitte geben Sie mindestens eine gültige Startzeit (HH:MM) ein.');
            }
            // Wenn Endzeiten vorhanden sind, muss ihre Anzahl mit den Startzeiten übereinstimmen
            // (Ausnahme: laufender Timer, wo Endzeiten fehlen können)
            if (timeEntryData.endTimes.length > 0 && timeEntryData.startTimes.length !== timeEntryData.endTimes.length) {
                throw new Error('Die Anzahl der Start- und Endzeiten muss übereinstimmen.');
            }
            // Jede Startzeit muss vor der entsprechenden Endzeit liegen
            for (let i = 0; i < timeEntryData.startTimes.length; i++) {
                if (timeEntryData.endTimes[i] && timeEntryData.startTimes[i] >= timeEntryData.endTimes[i]) {
                    throw new Error(`Die Endzeit für Slot ${i + 1} muss nach der Startzeit liegen.`);
                }
            }
            // Jede Pausenstartzeit muss vor der Pausenendzeit liegen
            for (const itemBreak of timeEntryData.breaks) {
                if (itemBreak.start >= itemBreak.end) {
                    throw new Error('Die Pausenendzeit muss nach der Pausenstartzeit liegen.');
                }
            }


            if (isEditing) {
                await updateTimeEntry(entry.id, timeEntryData); // Bestehenden Eintrag aktualisieren
            } else {
                await createTimeEntry(timeEntryData); // Neuen Eintrag erstellen
            }

            onSuccess?.(); // Callback bei Erfolg aufrufen (z.B. Modal schließen)
        } catch (err) {
            console.error("Fehler beim Speichern des Zeiteintrags:", err);
            setError(err.message || 'Ein unbekannter Fehler ist aufgetreten.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title={isEditing ? 'Zeiteintrag bearbeiten' : 'Neuer Zeiteintrag'}>
            <form onSubmit={handleSubmit}>
                {/* Datums-Auswahl */}
                <DatePicker
                    label="Datum"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                />

                {/* Sektion für Arbeitszeiten (Start/Ende Slots) */}
                <div className="form-section">
                    <h4>Arbeitszeiten</h4>
                    {formData.startTimes.map((startTime, index) => (
                        <div key={`time-slot-${index}`} className="time-slot"> {/* Eindeutigerer Key */}
                            <TimePicker
                                label={`Start ${index + 1}`}
                                value={startTime}
                                onChange={(e) => handleTimeChange('startTimes', index, e.target.value)}
                                required
                            />
                            <TimePicker
                                label={`Ende ${index + 1}`}
                                value={formData.endTimes[index] || ''}
                                onChange={(e) => handleTimeChange('endTimes', index, e.target.value)}
                                // 'required' ist hier nicht zwingend, falls ein Timer noch läuft und keine Endzeit hat
                            />
                            {formData.startTimes.length > 1 && (
                                <Button
                                    type="button"
                                    variant="danger"
                                    size="small"
                                    onClick={() => handleRemoveTimeSlot(index)}
                                >
                                    Entfernen
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddTimeSlot}
                    >
                        Zeitslot hinzufügen
                    </Button>
                </div>

                {/* Sektion für Pausen */}
                <div className="form-section">
                    <h4>Pausen</h4>
                    {formData.breaks.map((breakTime, index) => (
                        <div key={`break-slot-${index}`} className="break-slot"> {/* Eindeutigerer Key */}
                            <TimePicker
                                label={`Pause Start ${index + 1}`}
                                value={breakTime.start}
                                onChange={(e) => handleBreakChange(index, 'start', e.target.value)}
                            />
                            <TimePicker
                                label={`Pause Ende ${index + 1}`}
                                value={breakTime.end}
                                onChange={(e) => handleBreakChange(index, 'end', e.target.value)}
                            />
                            <Button
                                type="button"
                                variant="danger"
                                size="small"
                                onClick={() => handleRemoveBreak(index)}
                            >
                                Entfernen
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddBreak}
                    >
                        Pause hinzufügen
                    </Button>
                </div>

                {/* Projektauswahl-Dropdown */}
                <div className="form-group">
                    <label className="form-label">Projekt (optional)</label>
                    <select
                        className="form-input"
                        value={formData.projectId} // Wert aus dem State binden
                        onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                    >
                        <option value="">Kein Projekt ausgewählt</option>
                        {/* Projekte aus dem Context laden und als Optionen rendern */}
                        {projects?.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Fehlermeldung anzeigen */}
                {error && <div className="error-message">{error}</div>}

                {/* Formular-Aktionen (Speichern-Button) */}
                <div className="form-actions">
                    <Button type="submit" loading={loading}>
                        {isEditing ? 'Aktualisieren' : 'Erstellen'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default TimeEntryForm;
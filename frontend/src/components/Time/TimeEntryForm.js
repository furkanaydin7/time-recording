import React, { useState, useEffect } from 'react';
import { useTimeEntries } from '../../contexts/TimeEntryContext';
import { useProjects } from '../../contexts/ProjectContext';
import Button from '../common/Button';
import FormInput from '../common/FormInput';
import DatePicker from '../common/DatePicker';
import TimePicker from '../common/TimePicker';
import Card from '../common/Card';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const TimeEntryForm = ({ entry = null, onSuccess }) => {
    const { createTimeEntry, updateTimeEntry } = useTimeEntries();
    const { projects } = useProjects();
    const [formData, setFormData] = useState({
        date: entry?.date || new Date().toISOString().split('T')[0],
        startTimes: entry?.startTimes || [''],
        endTimes: entry?.endTimes || [''],
        breaks: entry?.breaks || [],
        projectId: entry?.project?.id || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!entry;

    const handleAddTimeSlot = () => {
        setFormData({
            ...formData,
            startTimes: [...formData.startTimes, ''],
            endTimes: [...formData.endTimes, '']
        });
    };

    const handleRemoveTimeSlot = (index) => {
        setFormData({
            ...formData,
            startTimes: formData.startTimes.filter((_, i) => i !== index),
            endTimes: formData.endTimes.filter((_, i) => i !== index)
        });
    };

    const handleTimeChange = (type, index, value) => {
        const newTimes = [...formData[type]];
        newTimes[index] = value;
        setFormData({
            ...formData,
            [type]: newTimes
        });
    };

    const handleAddBreak = () => {
        setFormData({
            ...formData,
            breaks: [...formData.breaks, { start: '', end: '' }]
        });
    };

    const handleRemoveBreak = (index) => {
        setFormData({
            ...formData,
            breaks: formData.breaks.filter((_, i) => i !== index)
        });
    };

    const handleBreakChange = (index, field, value) => {
        const newBreaks = [...formData.breaks];
        newBreaks[index] = { ...newBreaks[index], [field]: value };
        setFormData({
            ...formData,
            breaks: newBreaks
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // WICHTIG: Immer Arrays senden, niemals null/undefined
            const timeEntryData = {
                date: formData.date,
                startTimes: (formData.startTimes || []).filter(t => t && t.trim()), // Leere/null Einträge sicher entfernen
                endTimes: (formData.endTimes || []).filter(t => t && t.trim()),     // Leere/null Einträge sicher entfernen
                breaks: (formData.breaks || []).filter(b => b.start && b.end && b.start.trim() && b.end.trim()), // Nur vollständige Pausen
                projectId: formData.projectId || null
            };

            // Mindestens ein Zeitslot muss vorhanden sein für normale Einträge
            if (timeEntryData.startTimes.length === 0 || timeEntryData.endTimes.length === 0) {
                throw new Error('Bitte geben Sie mindestens eine Start- und Endzeit ein.');
            }

            if (isEditing) {
                await updateTimeEntry(entry.id, timeEntryData);
            } else {
                await createTimeEntry(timeEntryData);
            }

            onSuccess?.();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title={isEditing ? 'Zeiteintrag bearbeiten' : 'Neuer Zeiteintrag'}>
            <form onSubmit={handleSubmit}>
                <DatePicker
                    label="Datum"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                />

                <div className="form-section">
                    <h4>Arbeitszeiten</h4>
                    {formData.startTimes.map((startTime, index) => (
                        <div key={index} className="time-slot">
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
                                required
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

                <div className="form-section">
                    <h4>Pausen</h4>
                    {formData.breaks.map((breakTime, index) => (
                        <div key={index} className="break-slot">
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

                <div className="form-group">
                    <label className="form-label">Projekt (optional)</label>
                    <select
                        className="form-input"
                        value={formData.projectId}
                        onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                    >
                        <option value="">Kein Projekt ausgewählt</option>
                        {projects?.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>

                {error && <div className="error-message">{error}</div>}

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

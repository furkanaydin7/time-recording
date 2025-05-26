import React, { useState } from 'react';
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

const ManualTimeEntryForm = ({ onSuccess }) => {
    const { createTimeEntry } = useTimeEntries();
    const { projects } = useProjects();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        breakStart: '',
        breakEnd: '',
        actualHours: '',
        plannedHours: '8.0',
        projectId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const calculateHours = (start, end, breakStart = '', breakEnd = '') => {
        if (!start || !end) return '0.0';

        const startDate = new Date(`2000-01-01T${start}`);
        const endDate = new Date(`2000-01-01T${end}`);
        let totalMs = endDate - startDate;

        // Pause abziehen falls vorhanden
        if (breakStart && breakEnd) {
            const breakStartDate = new Date(`2000-01-01T${breakStart}`);
            const breakEndDate = new Date(`2000-01-01T${breakEnd}`);
            const breakMs = breakEndDate - breakStartDate;
            totalMs -= breakMs;
        }

        const hours = totalMs / (1000 * 60 * 60);
        return Math.max(0, hours).toFixed(1);
    };

    const handleTimeChange = (field, value) => {
        const newFormData = { ...formData, [field]: value };

        // Automatische Berechnung der Stunden
        if (field === 'startTime' || field === 'endTime' || field === 'breakStart' || field === 'breakEnd') {
            const calculatedHours = calculateHours(
                newFormData.startTime,
                newFormData.endTime,
                newFormData.breakStart,
                newFormData.breakEnd
            );
            newFormData.actualHours = calculatedHours;
        }

        setFormData(newFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validierung
            if (!formData.startTime || !formData.endTime) {
                throw new Error('Start- und Endzeit sind erforderlich.');
            }

            if (formData.breakStart && !formData.breakEnd) {
                throw new Error('Bitte geben Sie auch die Pausenendzeit ein.');
            }

            if (!formData.breakStart && formData.breakEnd) {
                throw new Error('Bitte geben Sie auch die Pausenstartzeit ein.');
            }

            // Backend-Format vorbereiten
            const timeEntryData = {
                date: formData.date,
                startTimes: [formData.startTime],
                endTimes: [formData.endTime],
                breaks: (formData.breakStart && formData.breakEnd) ? [{
                    start: formData.breakStart,
                    end: formData.breakEnd
                }] : [],
                projectId: formData.projectId || null
            };

            await createTimeEntry(timeEntryData);

            // Formular zurücksetzen
            setFormData({
                date: new Date().toISOString().split('T')[0],
                startTime: '',
                endTime: '',
                breakStart: '',
                breakEnd: '',
                actualHours: '',
                plannedHours: '8.0',
                projectId: ''
            });

            onSuccess?.();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Manueller Zeiteintrag">
            <form onSubmit={handleSubmit}>
                <DatePicker
                    label="Datum"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                />

                <div className="form-row">
                    <TimePicker
                        label="Startzeit"
                        value={formData.startTime}
                        onChange={(e) => handleTimeChange('startTime', e.target.value)}
                        required
                    />
                    <TimePicker
                        label="Endzeit"
                        value={formData.endTime}
                        onChange={(e) => handleTimeChange('endTime', e.target.value)}
                        required
                    />
                </div>

                <div className="form-section">
                    <h4>Pause (optional)</h4>
                    <div className="form-row">
                        <TimePicker
                            label="Pause Start"
                            value={formData.breakStart}
                            onChange={(e) => handleTimeChange('breakStart', e.target.value)}
                        />
                        <TimePicker
                            label="Pause Ende"
                            value={formData.breakEnd}
                            onChange={(e) => handleTimeChange('breakEnd', e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <FormInput
                        label="Geplante Stunden"
                        type="number"
                        step="0.1"
                        value={formData.plannedHours}
                        onChange={(e) => setFormData({...formData, plannedHours: e.target.value})}
                        required
                    />
                    <FormInput
                        label="Berechnete Stunden"
                        type="text"
                        value={formData.actualHours}
                        readOnly
                        placeholder="Wird automatisch berechnet"
                    />
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
                        Zeiteintrag erstellen
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default ManualTimeEntryForm;
import React, { useState } from 'react';
import { useAbsences } from '../../contexts/AbsenceContext';
import Button from '../common/Button';
import DatePicker from '../common/DatePicker';
import Card from '../common/Card';
/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const AbsenceForm = ({ absence = null, onSuccess }) => {
    const { createAbsence, updateAbsence } = useAbsences();
    const [formData, setFormData] = useState({
        startDate: absence?.startDate || '',
        endDate: absence?.endDate || '',
        type: absence?.type || 'VACATION'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!absence;

    // Backend Absence Types - direkt aus Backend Enum
    const absenceTypes = [
        { value: 'VACATION', label: 'Urlaub' },
        { value: 'ILLNESS', label: 'Krankheit' },
        { value: 'HOME_OFFICE', label: 'Home Office' },
        { value: 'TRAINING', label: 'Fortbildung' },
        { value: 'PUBLIC_HOLIDAY', label: 'Feiertag' },
        { value: 'UNPAID_LEAVE', label: 'Unbezahlter Urlaub' },
        { value: 'SPECIAL_LEAVE', label: 'Sonderurlaub' },
        { value: 'OTHER', label: 'Sonstige' }
    ];

    const validateForm = () => {
        if (!formData.startDate || !formData.endDate) {
            setError('Bitte Start- und Enddatum angeben');
            return false;
        }

        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            setError('Startdatum muss vor dem Enddatum liegen');
            return false;
        }

        return true;
    };

    const calculateDuration = () => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return diffDays;
        }
        return 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            // Backend Format: { startDate, endDate, type }
            const absenceData = {
                startDate: formData.startDate,
                endDate: formData.endDate,
                type: formData.type
            };

            if (isEditing) {
                await updateAbsence(absence.id, absenceData);
            } else {
                await createAbsence(absenceData);
            }

            onSuccess?.();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title={isEditing ? 'Abwesenheit bearbeiten' : 'Neue Abwesenheit'}>
            <form onSubmit={handleSubmit}>
                <DatePicker
                    label="Startdatum"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                />

                <DatePicker
                    label="Enddatum"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    required
                />

                <div className="form-group">
                    <label className="form-label required">Typ</label>
                    <select
                        className="form-input"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        required
                    >
                        {absenceTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                {formData.startDate && formData.endDate && (
                    <div className="form-info">
                        <strong>Dauer: {calculateDuration()} Tag(e)</strong>
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                    <Button type="submit" loading={loading}>
                        {isEditing ? 'Aktualisieren' : 'Beantragen'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default AbsenceForm;
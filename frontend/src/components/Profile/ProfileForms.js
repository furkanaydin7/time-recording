import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import FormInput from '../common/FormInput';
import Card from '../common/Card';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const ProfileForm = () => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        plannedHoursPerDay: user?.plannedHoursPerDay || 8.0
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await updateProfile(formData);
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Profil bearbeiten">
            <form onSubmit={handleSubmit}>
                <FormInput
                    label="Vorname"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                />
                <FormInput
                    label="Nachname"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                />
                <FormInput
                    type="email"
                    label="E-Mail"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                />
                <FormInput
                    type="number"
                    label="Geplante Stunden pro Tag"
                    value={formData.plannedHoursPerDay}
                    onChange={(e) => setFormData({...formData, plannedHoursPerDay: parseFloat(e.target.value)})}
                    min="1"
                    max="24"
                    step="0.5"
                    required
                />

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">Profil erfolgreich aktualisiert!</div>}

                <Button type="submit" loading={loading}>
                    Speichern
                </Button>
            </form>
        </Card>
    );
};

export default ProfileForm;

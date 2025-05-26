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

const ChangePasswordForm = () => {
    const { changePassword } = useAuth();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Passwort muss mindestens 6 Zeichen lang sein';
        }

        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setSuccess(false);

        try {
            await changePassword({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });
            setSuccess(true);
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setErrors({ submit: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Passwort ändern">
            <form onSubmit={handleSubmit}>
                <FormInput
                    type="password"
                    label="Aktuelles Passwort"
                    value={formData.oldPassword}
                    onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                    required
                />
                <FormInput
                    type="password"
                    label="Neues Passwort"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    error={errors.newPassword}
                    required
                />
                <FormInput
                    type="password"
                    label="Neues Passwort bestätigen"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    error={errors.confirmPassword}
                    required
                />

                {errors.submit && <div className="error-message">{errors.submit}</div>}
                {success && <div className="success-message">Passwort erfolgreich geändert!</div>}

                <Button type="submit" loading={loading}>
                    Passwort ändern
                </Button>
            </form>
        </Card>
    );
};

export default ChangePasswordForm;
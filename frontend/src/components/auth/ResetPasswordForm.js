export default LoginForm;

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import FormInput from '../common/FormInput';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const ResetPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await resetPassword(email);
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="success-message">
                Reset-Link wurde an {email} gesendet.
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="reset-form">
            <FormInput
                type="email"
                label="E-Mail Adresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            {error && <div className="error-message">{error}</div>}
            <Button type="submit" loading={loading}>
                Passwort zurücksetzen
            </Button>
        </form>
    );
};
export default ResetPasswordForm;
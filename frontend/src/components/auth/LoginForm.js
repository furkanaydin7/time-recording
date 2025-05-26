import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import FormInput from '../common/FormInput';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const LoginForm = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(credentials);
        } catch (err) {
            // Backend Error Messages anpassen
            let errorMessage = err.message;
            if (errorMessage.includes('Login failed')) {
                errorMessage = 'Ungültige Anmeldedaten';
            } else if (errorMessage.includes('Please change your password')) {
                errorMessage = 'Bitte ändern Sie Ihr Passwort';
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <FormInput
                type="email"
                label="E-Mail"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                required
                placeholder="ihre.email@firma.ch"
            />
            <FormInput
                type="password"
                label="Passwort"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
                placeholder="Ihr Passwort"
            />
            {error && <div className="error-message">{error}</div>}
            <Button type="submit" loading={loading}>
                Anmelden
            </Button>
        </form>
    );
};

export default LoginForm;
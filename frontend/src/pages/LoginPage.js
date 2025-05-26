import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import Card from '../components/common/Card';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const LoginPage = () => {
    const { user, loading } = useAuth();
    const [showResetForm, setShowResetForm] = React.useState(false);

    if (loading) {
        return <div className="loading-page">Lädt...</div>;
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <h1>Time Recording System</h1>
                    <p>Bitte melden Sie sich an</p>
                </div>

                {showResetForm ? (
                    <Card>
                        <ResetPasswordForm />
                        <div className="form-links">
                            <button
                                type="button"
                                className="link-button"
                                onClick={() => setShowResetForm(false)}
                            >
                                Zurück zum Login
                            </button>
                        </div>
                    </Card>
                ) : (
                    <Card>
                        <LoginForm />
                        <div className="form-links">
                            <button
                                type="button"
                                className="link-button"
                                onClick={() => setShowResetForm(true)}
                            >
                                Passwort vergessen?
                            </button>
                        </div>
                    </Card>
                )}

                <div className="demo-users">
                    <h3>Demo-Benutzer (aus Backend DataInitializer):</h3>
                    <ul>
                        <li><strong>Admin:</strong> admin@timerecording.ch / admin123</li>
                        <li><strong>Manager:</strong> manager@timerecording.ch / manager123</li>
                        <li><strong>Anna Schmidt:</strong> anna.schmidt@timerecording.ch / employee123</li>
                        <li><strong>Peter Müller:</strong> peter.mueller@timerecording.ch / employee123</li>
                        <li><strong>Laura Weber:</strong> laura.weber@timerecording.ch / employee123</li>
                        <li><strong>Thomas Fischer:</strong> thomas.fischer@timerecording.ch / employee123</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
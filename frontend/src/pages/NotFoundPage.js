import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const NotFoundPage = () => {
    return (
        <div className="not-found-page">
            <div className="not-found-container">
                <div className="not-found-content">
                    <h1 className="not-found-title">404</h1>
                    <h2 className="not-found-subtitle">Seite nicht gefunden</h2>
                    <p className="not-found-message">
                        Die angeforderte Seite konnte nicht gefunden werden.
                    </p>
                    <div className="not-found-actions">
                        <Link to="/dashboard">
                            <Button variant="primary">
                                Zum Dashboard
                            </Button>
                        </Link>
                        <Button
                            variant="secondary"
                            onClick={() => window.history.back()}
                        >
                            Zurück
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

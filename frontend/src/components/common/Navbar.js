
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Backend Rollen checken (ROLE_ADMIN vs ADMIN)
    const isAdmin = user?.roles?.some(role =>
        role === 'ADMIN' || role === 'ROLE_ADMIN'
    );

    const isManager = user?.roles?.some(role =>
        role === 'MANAGER' || role === 'ROLE_MANAGER'
    );

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/dashboard">Time Recording</Link>
            </div>

            <div className="navbar-nav">
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/time-entries" className="nav-link">Zeiterfassung</Link>
                <Link to="/projects" className="nav-link">Projekte</Link>
                <Link to="/absences" className="nav-link">Abwesenheiten</Link>

                {(isAdmin || isManager) && (
                    <Link to="/admin" className="nav-link">Administration</Link>
                )}
            </div>

            <div className="navbar-user">
        <span className="user-name">
          {user?.firstName} {user?.lastName}
        </span>
                <Button variant="secondary" size="small" onClick={handleLogout}>
                    Abmelden
                </Button>
            </div>
        </nav>
    );
};

export default Navbar;
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/time-entries', label: 'Zeiterfassung', icon: '⏰' },
        { path: '/projects', label: 'Projekte', icon: '📁' },
        { path: '/absences', label: 'Abwesenheiten', icon: '🏖️' },
        { path: '/profile', label: 'Profil', icon: '👤' },
    ];

    const adminItems = [
        { path: '/admin/users', label: 'Benutzerverwaltung', icon: '👥' },
        { path: '/admin/projects', label: 'Projektverwaltung', icon: '🗂️' },
        { path: '/admin/reports', label: 'Berichte', icon: '📈' },
    ];

    // Backend Rollen checken
    const isAdmin = user?.roles?.some(role =>
        role === 'ADMIN' || role === 'ROLE_ADMIN'
    );

    const isManager = user?.roles?.some(role =>
        role === 'MANAGER' || role === 'ROLE_MANAGER'
    );

    return (
        <aside className="sidebar">
            <div className="sidebar-section">
                <h3 className="sidebar-title">Navigation</h3>
                <ul className="sidebar-menu">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`sidebar-link ${
                                    location.pathname === item.path ? 'active' : ''
                                }`}
                            >
                                <span className="sidebar-icon">{item.icon}</span>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {(isAdmin || isManager) && (
                <div className="sidebar-section">
                    <h3 className="sidebar-title">Administration</h3>
                    <ul className="sidebar-menu">
                        {adminItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`sidebar-link ${
                                        location.pathname === item.path ? 'active' : ''
                                    }`}
                                >
                                    <span className="sidebar-icon">{item.icon}</span>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
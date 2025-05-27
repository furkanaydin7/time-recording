import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTimeEntries } from '../contexts/TimeEntryContext';
import { useAbsences } from '../contexts/AbsenceContext';
import Card from '../components/common/Card';
import TimeTracker from '../components/time/TimeTracker';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.1 - Funktion für Admin hinzugefügt
 */

const DashboardPage = () => {
    const { user } = useAuth();
    const { timeEntries } = useTimeEntries();
    const { absences } = useAbsences();
    const [stats, setStats] = useState({
        todayHours: '00:00',
        weekHours: '00:00',
        monthHours: '00:00',
        pendingAbsences: 0,
        upcomingAbsences: 0
    });

    /**
     * Admin States
     * @author PD
     */
    const [users, setUsers] = useState([]);
    const [loadingReset, setLoadingReset] = useState(null);

    /**
     * Admin Rolle prüfen
     * @type {boolean|*}
     * @author PD
     * Quelle: ChatGPT.com
     */
    const isAdmin = React.useMemo(() => {
        if (!user) return false;

        // Verschiedene Wege der Admin-Rolle prüfen
        const roles = user.roles || user.authorities || [];

        if (Array.isArray(roles)) {
            return roles.some(role => {
                const roleStr = (role.name || role || '').toString().toUpperCase();
                return roleStr === 'ADMIN' ||
                    roleStr === 'ROLE_ADMIN' ||
                    roleStr.includes('ADMIN');
            });
        }

        // Fallback für direkte role property
        const userRole = (user.role || '').toString().toUpperCase();
        return userRole === 'ADMIN' || userRole === 'ROLE_ADMIN' || userRole.includes('ADMIN');
    }, [user]);

    useEffect(() => {
        calculateStats();
    }, [timeEntries, absences]);

    if (isAdmin) {
        fetchAllUsers();
    }

    /**
     * Admin Funktionen
     * @author PD
     * @returns {Promise<void>}
     * Quelle: ChatGPT.com
     */
    const fetchAllUsers = async () => {
        if (!isAdmin) {
            console.log('Kein Admin-Zugriff für fetchAllUsers');
            return;
        }

        try {
            const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');

            if (!token) {
                console.error('Kein Token für Admin-Anfrage gefunden');
                return;
            }

            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 403) {
                console.error('Admin-Zugriff verweigert (403)');
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setUsers(Array.isArray(data) ? data : data.users || []);
                console.log(`${Array.isArray(data) ? data.length : (data.users || []).length} Benutzer geladen`);
            } else {
                console.error('Fehler beim Laden der Benutzer:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Benutzer:', error);
        }
    };

    const resetUserPassword = async (userId, userName) => {
        if (!window.confirm(`Passwort für ${userName} wirklich zurücksetzen?`)) {
            return;
        }

        setLoadingReset(userId);
        try {
            const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Fehler beim Zurücksetzen');
            }

            const data = await response.json();

            // Temporäres Passwort anzeigen
            window.alert(`Neues temporäres Passwort für ${userName}:\n\n${data.temporaryPassword}\n\nBitte sicher weiterleiten!`);

        } catch (error) {
            console.error('Fehler beim Zurücksetzen:', error);
            window.alert('Fehler: ' + error.message);
        } finally {
            setLoadingReset(null);
        }
    };

    const calculateStats = () => {
        if (!timeEntries) return;

        const today = new Date().toISOString().split('T')[0];
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
        const startOfMonth = new Date();
        startOfMonth.setDate(1);

        // Heute
        const todayEntries = timeEntries.filter(entry => entry.date === today);
        const todayHours = todayEntries.reduce((sum, entry) => {
            return sum + parseHours(entry.actualHours || '00:00');
        }, 0);

        // Diese Woche
        const weekEntries = timeEntries.filter(entry =>
            new Date(entry.date) >= startOfWeek
        );
        const weekHours = weekEntries.reduce((sum, entry) => {
            return sum + parseHours(entry.actualHours || '00:00');
        }, 0);

        // Dieser Monat
        const monthEntries = timeEntries.filter(entry =>
            new Date(entry.date) >= startOfMonth
        );
        const monthHours = monthEntries.reduce((sum, entry) => {
            return sum + parseHours(entry.actualHours || '00:00');
        }, 0);

        // Abwesenheiten
        const pendingAbsences = absences?.filter(absence =>
            absence.approved === null || absence.approved === undefined
        )?.length || 0;

        const upcomingAbsences = absences?.filter(absence =>
            absence.approved === true && new Date(absence.startDate) > new Date()
        )?.length || 0;

        setStats({
            todayHours: formatHours(todayHours),
            weekHours: formatHours(weekHours),
            monthHours: formatHours(monthHours),
            pendingAbsences,
            upcomingAbsences
        });
    };

    const parseHours = (timeString) => {
        if (!timeString) return 0;
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours + (minutes / 60);
    };

    const formatHours = (hours) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Willkommen, {user?.firstName}!</h1>
                <p>Übersicht über Ihre Arbeitszeiten und Abwesenheiten</p>
            </div>

            <div className="dashboard-grid">
                {/* Zeit-Tracker */}
                <div className="dashboard-section">
                    <TimeTracker />
                </div>

                {/* Statistiken */}
                <div className="dashboard-section">
                    <Card title="Arbeitszeit-Übersicht">
                        <div className="stats-grid">
                            <div className="stat-item">
                                <div className="stat-value">{stats.todayHours}</div>
                                <div className="stat-label">Heute</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">{stats.weekHours}</div>
                                <div className="stat-label">Diese Woche</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">{stats.monthHours}</div>
                                <div className="stat-label">Dieser Monat</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Abwesenheiten */}
                <div className="dashboard-section">
                    <Card title="Abwesenheiten">
                        <div className="absence-summary">
                            <div className="absence-stat">
                                <span className="absence-count">{stats.pendingAbsences}</span>
                                <span className="absence-label">Ausstehend</span>
                            </div>
                            <div className="absence-stat">
                                <span className="absence-count">{stats.upcomingAbsences}</span>
                                <span className="absence-label">Geplant</span>
                            </div>
                        </div>
                        <div className="card-actions">
                            <Link to="/absences">
                                <Button variant="secondary" size="small">
                                    Alle anzeigen
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* Admin-Bereich - nur für Admins sichtbar Autor PD; Quelle: ChatGPT.com*/}
                {isAdmin && (
                    <div className="dashboard-section dashboard-section-wide">
                        <Card title="Admin - Benutzerverwaltung">
                            <div className="admin-users">
                                {users.length > 0 ? (
                                    <div className="users-list">
                                        {users.slice(0, 10).map(userItem => (
                                            <div key={userItem.id} className="user-item">
                                                <div className="user-info">
                                                    <span className="user-name">
                                                        {userItem.firstName} {userItem.lastName}
                                                    </span>
                                                    <span className="user-email">
                                                        {userItem.email}
                                                    </span>
                                                    <span className={`user-status ${userItem.active ? 'active' : 'inactive'}`}>
                                                        {userItem.active ? 'Aktiv' : 'Inaktiv'}
                                                    </span>
                                                </div>
                                                <div className="user-actions">
                                                    <Button
                                                        onClick={() => resetUserPassword(
                                                            userItem.id,
                                                            `${userItem.firstName} ${userItem.lastName}`
                                                        )}
                                                        loading={loadingReset === userItem.id}
                                                        variant="secondary"
                                                        size="small"
                                                    >
                                                        🔑 Passwort zurücksetzen
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {users.length > 10 && (
                                            <div className="users-more">
                                                <p>...und {users.length - 10} weitere Benutzer</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <p>Keine Benutzer gefunden.</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {/* Schnellaktionen */}
                <div className="dashboard-section">
                    <Card title="Schnellaktionen">
                        <div className="quick-actions">
                            <Link to="/time-entries/new">
                                <Button variant="primary" size="small">
                                    Zeiteintrag erfassen
                                </Button>
                            </Link>
                            <Link to="/absences/new">
                                <Button variant="secondary" size="small">
                                    Abwesenheit beantragen
                                </Button>
                            </Link>
                            <Link to="/projects">
                                <Button variant="secondary" size="small">
                                    Projekte anzeigen
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* Letzte Aktivitäten */}
                <div className="dashboard-section dashboard-section-wide">
                    <Card title="Letzte Zeiteinträge">
                        <div className="recent-entries">
                            {timeEntries?.slice(0, 5).map(entry => (
                                <div key={entry.id} className="recent-entry">
                                    <div className="entry-date">
                                        {new Date(entry.date).toLocaleDateString('de-DE')}
                                    </div>
                                    <div className="entry-hours">
                                        {entry.actualHours || '00:00'}
                                    </div>
                                    {entry.project && (
                                        <div className="entry-project">
                                            {entry.project.name}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {(!timeEntries || timeEntries.length === 0) && (
                                <div className="empty-state">
                                    <p>Noch keine Zeiteinträge vorhanden.</p>
                                </div>
                            )}
                        </div>
                        <div className="card-actions">
                            <Link to="/time-entries">
                                <Button variant="secondary" size="small">
                                    Alle anzeigen
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

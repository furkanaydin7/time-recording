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
 * @version 1.0
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

    useEffect(() => {
        calculateStats();
    }, [timeEntries, absences]);

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

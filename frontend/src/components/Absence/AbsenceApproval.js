import React, { useState } from 'react';
import { useAbsences } from '../../contexts/AbsenceContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Card from '../common/Card';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const AbsenceApproval = () => {
    const { pendingAbsences, approveAbsence, rejectAbsence, loading } = useAbsences();
    const { user } = useAuth();
    const [processing, setProcessing] = useState({});

    const handleApprove = async (absenceId) => {
        setProcessing(prev => ({ ...prev, [absenceId]: 'approving' }));
        try {
            await approveAbsence(absenceId);
        } catch (error) {
            console.error('Fehler beim Genehmigen:', error);
        } finally {
            setProcessing(prev => ({ ...prev, [absenceId]: null }));
        }
    };

    const handleReject = async (absenceId) => {
        if (window.confirm('Möchten Sie diese Abwesenheit wirklich ablehnen?')) {
            setProcessing(prev => ({ ...prev, [absenceId]: 'rejecting' }));
            try {
                await rejectAbsence(absenceId);
            } catch (error) {
                console.error('Fehler beim Ablehnen:', error);
            } finally {
                setProcessing(prev => ({ ...prev, [absenceId]: null }));
            }
        }
    };

    const getTypeLabel = (type) => {
        const typeMap = {
            'VACATION': 'Urlaub',
            'ILLNESS': 'Krankheit',
            'HOME_OFFICE': 'Home Office',
            'TRAINING': 'Fortbildung',
            'PUBLIC_HOLIDAY': 'Feiertag',
            'UNPAID_LEAVE': 'Unbezahlter Urlaub',
            'SPECIAL_LEAVE': 'Sonderurlaub',
            'OTHER': 'Sonstige'
        };
        return typeMap[type] || type;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('de-DE');
    };

    const calculateDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    // Nur Manager und Admins können Abwesenheiten genehmigen
    if (!user?.roles?.some(role => ['ADMIN', 'MANAGER'].includes(role))) {
        return null;
    }

    if (loading) {
        return <div className="loading">Lädt ausstehende Abwesenheiten...</div>;
    }

    return (
        <Card title="Ausstehende Abwesenheiten">
            {pendingAbsences?.length === 0 ? (
                <div className="empty-state">
                    <p>Keine ausstehenden Abwesenheiten zur Genehmigung.</p>
                </div>
            ) : (
                <div className="absence-approval-list">
                    {pendingAbsences?.map(absence => (
                        <div key={absence.id} className="absence-approval-item">
                            <div className="absence-info">
                                <div className="employee-info">
                                    <strong>{absence.firstName} {absence.lastName}</strong>
                                    <span className="employee-email">{absence.email}</span>
                                </div>

                                <div className="absence-details">
                                    <div className="absence-type">{getTypeLabel(absence.type)}</div>
                                    <div className="absence-dates">
                                        {formatDate(absence.startDate)} - {formatDate(absence.endDate)}
                                        <span className="absence-duration">
                      ({calculateDuration(absence.startDate, absence.endDate)} Tag(e))
                    </span>
                                    </div>
                                    <div className="absence-requested">
                                        Beantragt am: {formatDate(absence.createdAt)}
                                    </div>
                                </div>
                            </div>

                            <div className="approval-actions">
                                <Button
                                    variant="success"
                                    size="small"
                                    onClick={() => handleApprove(absence.id)}
                                    loading={processing[absence.id] === 'approving'}
                                    disabled={processing[absence.id]}
                                >
                                    Genehmigen
                                </Button>
                                <Button
                                    variant="danger"
                                    size="small"
                                    onClick={() => handleReject(absence.id)}
                                    loading={processing[absence.id] === 'rejecting'}
                                    disabled={processing[absence.id]}
                                >
                                    Ablehnen
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default AbsenceApproval;
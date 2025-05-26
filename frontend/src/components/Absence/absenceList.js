import React, { useState } from 'react';
import { useAbsences } from '../../contexts/AbsenceContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Card from '../common/Card';
import Modal from '../common/Modal';
import AbsenceForm from './AbsenceForm';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const AbsenceList = () => {
    const { absences, deleteAbsence, loading } = useAbsences();
    const { user } = useAuth();
    const [editingAbsence, setEditingAbsence] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleEdit = (absence) => {
        setEditingAbsence(absence);
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Möchten Sie diese Abwesenheit wirklich löschen?')) {
            await deleteAbsence(id);
        }
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        setEditingAbsence(null);
    };

    const getStatusColor = (absence) => {
        if (absence.approved === true) return 'success';
        if (absence.approved === false) return 'danger';
        return 'warning';
    };

    const getStatusText = (absence) => {
        if (absence.approved === true) return 'Genehmigt';
        if (absence.approved === false) return 'Abgelehnt';
        return 'Ausstehend';
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

    if (loading) {
        return <div className="loading">Lädt Abwesenheiten...</div>;
    }

    return (
        <>
            <Card title="Meine Abwesenheiten">
                {absences?.length === 0 ? (
                    <div className="empty-state">
                        <p>Noch keine Abwesenheiten beantragt.</p>
                    </div>
                ) : (
                    <div className="absence-list">
                        {absences?.map(absence => (
                            <div key={absence.id} className="absence-item">
                                <div className="absence-info">
                                    <div className="absence-header">
                                        <h4 className="absence-type">{getTypeLabel(absence.type)}</h4>
                                        <span className={`status status-${getStatusColor(absence)}`}>
                      {getStatusText(absence)}
                    </span>
                                    </div>

                                    <div className="absence-dates">
                                        {formatDate(absence.startDate)} - {formatDate(absence.endDate)}
                                        <span className="absence-duration">
                      ({calculateDuration(absence.startDate, absence.endDate)} Tag(e))
                    </span>
                                    </div>

                                    <div className="absence-meta">
                                        Beantragt am: {formatDate(absence.createdAt)}
                                    </div>
                                </div>

                                <div className="absence-actions">
                                    {!absence.approved && (
                                        <>
                                            <Button
                                                variant="secondary"
                                                size="small"
                                                onClick={() => handleEdit(absence)}
                                            >
                                                Bearbeiten
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="small"
                                                onClick={() => handleDelete(absence.id)}
                                            >
                                                Löschen
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Abwesenheit bearbeiten"
                size="medium"
            >
                <AbsenceForm
                    absence={editingAbsence}
                    onSuccess={handleEditSuccess}
                />
            </Modal>
        </>
    );
};

export default AbsenceList;
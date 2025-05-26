import React, { useState } from 'react';
import { useTimeEntries } from '../../contexts/TimeEntryContext';
import Button from '../common/Button';
import Card from '../common/Card';
import Modal from '../common/Modal';
import TimeEntryForm from './TimeEntryForm';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const TimeEntryList = () => {
    const { timeEntries, deleteTimeEntry, loading } = useTimeEntries();
    const [editingEntry, setEditingEntry] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleEdit = (entry) => {
        setEditingEntry(entry);
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Möchten Sie diesen Zeiteintrag wirklich löschen?')) {
            await deleteTimeEntry(id);
        }
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        setEditingEntry(null);
    };

    const formatTime = (time) => {
        return time ? time.substring(0, 5) : '';
    };

    const formatDuration = (actualHours) => {
        return actualHours || '00:00';
    };

    if (loading) {
        return <div className="loading">Lädt Zeiteinträge...</div>;
    }

    return (
        <>
            <Card title="Meine Zeiteinträge">
                {timeEntries?.length === 0 ? (
                    <div className="empty-state">
                        <p>Noch keine Zeiteinträge vorhanden.</p>
                    </div>
                ) : (
                    <div className="time-entry-list">
                        {timeEntries?.map(entry => (
                            <div key={entry.id} className="time-entry-item">
                                <div className="entry-info">
                                    <div className="entry-date">
                                        {new Date(entry.date).toLocaleDateString('de-DE')}
                                    </div>
                                    <div className="entry-times">
                                        {entry.startTimes?.map((start, index) => (
                                            <span key={index} className="time-slot">
                        {formatTime(start)} - {formatTime(entry.endTimes?.[index])}
                      </span>
                                        ))}
                                    </div>
                                    <div className="entry-duration">
                                        Arbeitszeit: {formatDuration(entry.actualHours)}
                                    </div>
                                    {entry.project && (
                                        <div className="entry-project">
                                            Projekt: {entry.project.name}
                                        </div>
                                    )}
                                </div>
                                <div className="entry-actions">
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={() => handleEdit(entry)}
                                    >
                                        Bearbeiten
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="small"
                                        onClick={() => handleDelete(entry.id)}
                                    >
                                        Löschen
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Zeiteintrag bearbeiten"
                size="large"
            >
                <TimeEntryForm
                    entry={editingEntry}
                    onSuccess={handleEditSuccess}
                />
            </Modal>
        </>
    );
};

export default TimeEntryList;
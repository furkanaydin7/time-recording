import React, { useState } from 'react';
import TimeEntryForm from '../components/time/TimeEntryForm';
import ManualTimeEntryForm from '../components/time/ManualTimeEntryForm'; // NEU
import TimeEntryList from '../components/time/TimeEntryList';
import TimeTracker from '../components/time/TimeTracker';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const TimeEntryPage = () => {
    const [showNewEntryModal, setShowNewEntryModal] = useState(false);
    const [showManualEntryModal, setShowManualEntryModal] = useState(false); // NEU
    const [entryListKey, setEntryListKey] = useState(0); // Für Refresh

    const handleNewEntrySuccess = () => {
        setShowNewEntryModal(false);
        setEntryListKey(prev => prev + 1); // Liste aktualisieren
    };

    const handleManualEntrySuccess = () => { // NEU
        setShowManualEntryModal(false);
        setEntryListKey(prev => prev + 1); // Liste aktualisieren
    };

    return (
        <div className="time-entry-page">
            <div className="page-header">
                <h1>Zeiterfassung</h1>
                <div className="header-actions">
                    <Button
                        variant="secondary"
                        onClick={() => setShowManualEntryModal(true)}
                    >
                        Manueller Eintrag
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => setShowNewEntryModal(true)}
                    >
                        Mehrfach-Eintrag
                    </Button>
                </div>
            </div>

            <div className="time-entry-grid">
                <div className="time-entry-section">
                    <TimeTracker />
                </div>

                <div className="time-entry-section time-entry-section-wide">
                    <TimeEntryList key={entryListKey} />
                </div>
            </div>

            {/* Mehrfach-Eintrag Modal */}
            <Modal
                isOpen={showNewEntryModal}
                onClose={() => setShowNewEntryModal(false)}
                title="Mehrfach-Zeiteintrag"
                size="large"
            >
                <TimeEntryForm onSuccess={handleNewEntrySuccess} />
            </Modal>

            {/* Manueller Eintrag Modal */}
            <Modal
                isOpen={showManualEntryModal}
                onClose={() => setShowManualEntryModal(false)}
                title="Manueller Zeiteintrag"
                size="medium"
            >
                <ManualTimeEntryForm onSuccess={handleManualEntrySuccess} />
            </Modal>
        </div>
    );
};

export default TimeEntryPage;
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AbsenceForm from '../components/absence/AbsenceForm';
import AbsenceList from '../components/absence/AbsenceList';
import AbsenceApproval from '../components/absence/AbsenceApproval';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const AbsencePage = () => {
    const { user } = useAuth();
    const [showNewAbsenceModal, setShowNewAbsenceModal] = useState(false);

    const handleNewAbsenceSuccess = () => {
        setShowNewAbsenceModal(false);
    };

    const canApprove = user?.roles?.some(role => ['ADMIN', 'MANAGER'].includes(role));

    return (
        <div className="absence-page">
            <div className="page-header">
                <h1>Abwesenheiten</h1>
                <Button
                    variant="primary"
                    onClick={() => setShowNewAbsenceModal(true)}
                >
                    Neue Abwesenheit
                </Button>
            </div>

            <div className="absence-grid">
                {/* Genehmigung für Manager/Admin */}
                {canApprove && (
                    <div className="absence-section absence-section-wide">
                        <AbsenceApproval />
                    </div>
                )}

                {/* Eigene Abwesenheiten */}
                <div className="absence-section absence-section-wide">
                    <AbsenceList />
                </div>
            </div>

            <Modal
                isOpen={showNewAbsenceModal}
                onClose={() => setShowNewAbsenceModal(false)}
                title="Neue Abwesenheit beantragen"
                size="medium"
            >
                <AbsenceForm onSuccess={handleNewAbsenceSuccess} />
            </Modal>
        </div>
    );
};

export default AbsencePage;

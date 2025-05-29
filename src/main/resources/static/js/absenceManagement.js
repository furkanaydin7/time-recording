// * @author WK
async function viewAbsences() {
    try {
        const response = await apiCall('/api/absences');
        if (response && response.absences) {
            displayData('Meine Abwesenheiten', formatAbsencesTable(response.absences));
        } else {
            displayData('Meine Abwesenheiten', '<p>Keine Abwesenheiten gefunden.</p>');
        }
    } catch (error) {
        showError('Fehler beim Laden der Abwesenheiten: ' + (error.message || "Unbekannt").replace('DUPLICATE_ENTRY|', ''));
    }
}

function openCreateAbsenceModal() {
    const today = new Date().toISOString().split('T')[0];
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const absenceTypeInput = document.getElementById('absenceType');

    // Formular zurücksetzen und Standardwerte setzen
    const form = document.getElementById('createAbsenceForm');
    if (form) form.reset();

    if (startDateInput) {
        startDateInput.min = today;
        startDateInput.value = today; // Heute als Standard
    }
    if (endDateInput) {
        endDateInput.min = today;
        endDateInput.value = today; // Heute als Standard
    }
    if (absenceTypeInput) {
        absenceTypeInput.value = 'VACATION';
    }

    // Nachrichten ausblenden
    hideAllMessages();

    openModal('createAbsenceModal');
}

async function handleCreateAbsenceSubmit(event) {
    event.preventDefault();
    hideAllMessages();

    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const type = document.getElementById('absenceType').value;

    if (!startDate || !endDate || !type) {
        showError('⚠️ Bitte füllen Sie alle Pflichtfelder aus.');
        return;
    }

    if (new Date(endDate) < new Date(startDate)) {
        showError('⚠️ Das Enddatum muss nach oder gleich dem Startdatum liegen.');
        return;
    }

    const absenceData = {
        type: type,
        startDate: startDate,
        endDate: endDate
    };

    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Wird beantragt...';
    }

    try {
        console.log('📅 Beantrage Abwesenheit:', absenceData);
        const response = await apiCall('/api/absences', { method: 'POST', body: absenceData });

        if (response && response.id) {
            showSuccess('✅ Abwesenheit erfolgreich beantragt!');
            closeModal('createAbsenceModal');

            // Dashboard und Liste aktualisieren
            if (typeof loadDashboardPageData === 'function') {
                loadDashboardPageData(true);
            }
            viewAbsences();
        } else {
            showError('Fehler beim Beantragen: Unerwartete Antwort vom Server.');
        }
    } catch (error) {
        console.error('❌ Fehler beim Beantragen der Abwesenheit:', error);
        showError('❌ Fehler beim Beantragen der Abwesenheit: ' + (error.message || "Unbekannt").replace('DUPLICATE_ENTRY|', ''));
    } finally {

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Beantragen';
        }
    }
}

function validateAbsenceDates() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    if (startDateInput && endDateInput) {
        startDateInput.addEventListener('change', function() {
            endDateInput.min = this.value;
            if (endDateInput.value && new Date(endDateInput.value) < new Date(this.value)) {
                endDateInput.value = this.value;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    validateAbsenceDates();
});

async function viewPendingAbsencesForApproval() {
    try {
        console.log('📋 Lade ausstehende Abwesenheiten zur Genehmigung...');
        hideDataDisplay();
        const response = await apiCall(`/api/absences/pending?_t=${Date.now()}`);
        if (response && response.absences) {
            console.log(`✅ ${response.absences.length} ausstehende Abwesenheiten geladen`);
            if (response.absences.length === 0) {
                displayData('Ausstehende Abwesenheitsanträge', '<p>Keine Anträge zur Genehmigung vorhanden.</p>');
            } else {
                displayData('Ausstehende Abwesenheitsanträge', formatPendingAbsencesTableForApproval(response.absences));
            }
        } else {
            displayData('Ausstehende Abwesenheitsanträge', '<p>Keine Anträge gefunden oder Fehler beim Laden.</p>');
        }
    } catch (error) {
        console.error('❌ Fehler beim Laden der ausstehenden Abwesenheiten:', error);
        showError('Fehler beim Laden der ausstehenden Abwesenheiten: ' + (error.message || "Unbekannt"));
    }
}

async function approveAbsenceRequest(absenceId) {
    if (!confirm('Möchten Sie diesen Abwesenheitsantrag genehmigen?')) return;
    try {
        await apiCall(`/api/absences/${absenceId}/approve`, { method: 'PATCH' });
        showSuccess('Abwesenheitsantrag erfolgreich genehmigt.');
        viewPendingAbsencesForApproval();
        if (typeof loadDashboardPageData === 'function') {
            loadDashboardPageData(true);
        }
    } catch (error) {
        showError('Fehler beim Genehmigen des Antrags: ' + (error.message || "Unbekannt"));
    }
}

async function rejectAbsenceRequest(absenceId) {
    if (!confirm('Möchten Sie diesen Abwesenheitsantrag ablehnen?')) return;
    try {
        await apiCall(`/api/absences/${absenceId}/reject`, { method: 'PATCH' });
        showSuccess('Abwesenheitsantrag erfolgreich abgelehnt.');
        viewPendingAbsencesForApproval();
        if (typeof loadDashboardPageData === 'function') {
            loadDashboardPageData(true);
        }
    } catch (error) {
        showError('Fehler beim Ablehnen des Antrags: ' + (error.message || "Unbekannt"));
    }
}
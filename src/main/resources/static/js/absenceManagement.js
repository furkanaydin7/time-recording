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

let currentEditingAbsence = null; // Globale Variable für die aktuell bearbeitete Abwesenheit

function openEditAbsenceModal(absence) {
    if (!absence || typeof absence !== 'object') {
        showError("Ungültige Abwesenheitsdaten für die Bearbeitung.");
        return;
    }
    currentEditingAbsence = absence;

    document.getElementById('editAbsenceId').value = absence.id;
    document.getElementById('editAbsenceType').value = absence.type;
    document.getElementById('editAbsenceStartDate').value = absence.startDate;
    document.getElementById('editAbsenceEndDate').value = absence.endDate;
    document.getElementById('editAbsenceComment').value = absence.comment || ''; // Kommentar, falls vorhanden

    // Sicherstellen, dass das Startdatum nicht in der Vergangenheit liegt (außer es war schon so)
    const today = new Date().toISOString().split('T')[0];
    const startDateInput = document.getElementById('editAbsenceStartDate');
    if (absence.startDate < today) {
        startDateInput.min = absence.startDate; // Erlaube das ursprüngliche Datum
    } else {
        startDateInput.min = today;
    }
    document.getElementById('editAbsenceEndDate').min = startDateInput.value;


    hideAllMessages();
    openModal('editAbsenceModal');
}

async function handleEditAbsenceSubmit(event) {
    event.preventDefault();
    hideAllMessages();

    const absenceId = document.getElementById('editAbsenceId').value;
    const type = document.getElementById('editAbsenceType').value;
    const startDate = document.getElementById('editAbsenceStartDate').value;
    const endDate = document.getElementById('editAbsenceEndDate').value;
    const comment = document.getElementById('editAbsenceComment').value;

    if (!type || !startDate || !endDate) {
        showError('⚠️ Bitte füllen Sie alle Pflichtfelder (Typ, Von, Bis) aus.');
        return;
    }

    if (new Date(endDate) < new Date(startDate)) {
        showError('⚠️ Das Enddatum muss nach oder gleich dem Startdatum liegen.');
        return;
    }

    // Backend erwartet eventuell, dass das Startdatum nicht in der Vergangenheit liegt,
    // außer es ist das ursprüngliche Startdatum. Diese Logik ist primär im Backend.
    // Hier eine einfache Prüfung für neue Daten:
    const today = new Date().toISOString().split('T')[0];
    if (startDate < today && startDate !== currentEditingAbsence.startDate) {
        showWarning('Das Startdatum für eine neue oder geänderte Abwesenheit darf nicht in der Vergangenheit liegen, es sei denn, es ist das ursprünglich erfasste Datum.');
        // return; // Man könnte hier abbrechen oder es dem Backend überlassen
    }


    const absenceData = {
        // Die User-ID wird vom Backend anhand des eingeloggten Benutzers oder für Admins explizit gesetzt
        type: type,
        startDate: startDate,
        endDate: endDate,
        comment: comment
    };

    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Wird gespeichert...';
    }

    try {
        console.log(`📅 Aktualisiere Abwesenheit ${absenceId}:`, absenceData);
        // Der API-Endpunkt ist PUT /api/absences/{id}
        await apiCall(`/api/absences/${absenceId}`, { method: 'PUT', body: absenceData });

        showSuccess('✅ Abwesenheit erfolgreich aktualisiert!');
        closeModal('editAbsenceModal');
        currentEditingAbsence = null; // Zurücksetzen

        if (typeof loadDashboardPageData === 'function') {
            loadDashboardPageData(true); // Dashboard-Statistiken aktualisieren
        }
        viewAbsences(); // Abwesenheitsliste neu laden
    } catch (error) {
        console.error('❌ Fehler beim Aktualisieren der Abwesenheit:', error);
        showError('❌ Fehler beim Aktualisieren: ' + (error.message || "Unbekannt"));
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Änderungen speichern';
        }
    }
}

async function cancelAbsenceHandler(absenceId) {
    if (!absenceId) {
        showError("Keine Abwesenheits-ID zum Stornieren übergeben.");
        return;
    }

    // Eine zusätzliche Abfrage im Frontend ist sinnvoll, obwohl das Backend die letzte Autorität ist.
    // Die `formatAbsencesTable` sollte den Button idealerweise gar nicht erst anzeigen, wenn der Status nicht PENDING ist.
    // Diese Abfrage hier dient als Fallback oder falls die Tabelle nicht immer aktuell ist.
    const absenceToCancel = await apiCall(`/api/absences/${absenceId}`).catch(() => null); // Hilfsaufruf um aktuellen Status zu holen
    // Besser wäre, wenn der Status schon im UI Element wäre
    // Für diese Implementierung gehen wir davon aus,
    // dass der Button nur bei PENDING sichtbar ist.

    // In einer realen Anwendung würde man den Status direkt aus der Tabelle oder dem Event ziehen,
    // statt einen extra API Call zu machen. Da wir ihn nicht direkt haben, fragen wir den Benutzer.
    if (confirm('Sind Sie sicher, dass Sie diesen Abwesenheitsantrag stornieren möchten?')) {
        try {
            await apiCall(`/api/absences/${absenceId}`, { method: 'DELETE' });
            showSuccess('Abwesenheitsantrag erfolgreich storniert.');
            viewAbsences(); // Liste neu laden
            if (typeof loadDashboardPageData === 'function') {
                loadDashboardPageData(true); // Dashboard Statistiken aktualisieren
            }
        } catch (error) {
            showError('Fehler beim Stornieren des Antrags: ' + (error.message || "Unbekannt"));
        }
    }
}


// Event Listener für dynamische Datumsvalidierung im Edit-Modal
document.addEventListener('DOMContentLoaded', function() {
    validateAbsenceDates(); // Für das "Create Absence" Modal

    const editStartDateInput = document.getElementById('editAbsenceStartDate');
    const editEndDateInput = document.getElementById('editAbsenceEndDate');

    if (editStartDateInput && editEndDateInput) {
        editStartDateInput.addEventListener('change', function() {
            editEndDateInput.min = this.value;
            if (editEndDateInput.value && new Date(editEndDateInput.value) < new Date(this.value)) {
                editEndDateInput.value = this.value;
            }
        });
    }
});

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

async function viewTeamOrAllApprovedAbsencesHandler() {
    try {
        console.log('📋 Lade genehmigte Abwesenheiten für Admin/Manager Ansicht...');
        hideDataDisplay(); // Vorherige Ansicht schließen, falls offen
        // Der neue Endpunkt gibt sowohl 'absences' als auch 'title' zurück
        const response = await apiCall(`/api/absences/view/approved?_t=${Date.now()}`); // Cache-Buster

        if (response && response.absences) {
            console.log(`✅ ${response.absences.length} genehmigte Abwesenheiten geladen.`);
            const tableTitle = response.title || 'Genehmigte Abwesenheiten'; // Fallback-Titel
            if (response.absences.length === 0) {
                displayData(tableTitle, '<p>Keine genehmigten Abwesenheiten gefunden.</p>'); //
            } else {
                // formatAbsencesTable sollte bereits den Namen des Antragstellers anzeigen können
                displayData(tableTitle, formatAbsencesTable(response.absences)); //
            }
        } else {
            displayData('Genehmigte Abwesenheiten', '<p>Keine Anträge gefunden oder Fehler beim Laden.</p>');
        }
    } catch (error) {
        console.error('❌ Fehler beim Laden der genehmigten Abwesenheiten (Admin/Manager):', error);
        showError('Fehler beim Laden der genehmigten Abwesenheiten: ' + (error.message || "Unbekannt"));
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
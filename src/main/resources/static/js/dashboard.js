// * @author EK

window.projects = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Dashboard wird initialisiert (aus dashboard.js)...');
    const jwtToken = localStorage.getItem('jwtToken');

    if (!jwtToken) {
        console.log('❌ Kein JWT Token gefunden, Weiterleitung zum Login.');
        window.location.href = '/'; // Oder index.html
        return;
    }

    const userEmailFromStorage = localStorage.getItem('userEmail');
    const userEmailSpan = document.getElementById('userEmail');
    if (userEmailSpan && userEmailFromStorage) {
        userEmailSpan.textContent = userEmailFromStorage;
    }

    if (typeof initializeAdminFeatures === 'function') {
        initializeAdminFeatures();
    } else {
        console.warn("initializeAdminFeatures ist nicht definiert. Stelle sicher, dass admin.js korrekt geladen wurde.");
    }

    loadDashboardPageData();


    bindDashboardEventListeners();

    console.log('🎉 Dashboard initialisiert und Event Listener gebunden!');
});

function bindDashboardEventListeners() {
    // Logout Button
    const logoutButton = document.querySelector('.logout-btn');
    if (logoutButton) logoutButton.addEventListener('click', logout);

    // Passwort ändern Icon
    const changePwdIcon = document.getElementById('changePasswordIcon');
    if (changePwdIcon) changePwdIcon.addEventListener('click', openChangePasswordModal);

    // Passwort ändern Formular
    const changePwdForm = document.getElementById('changePasswordForm');
    if (changePwdForm) changePwdForm.addEventListener('submit', handleChangePasswordSubmit);

    // Zeiterfassung Karte
    document.getElementById('startTimer')?.addEventListener('click', startTimeTracking);
    document.getElementById('stopTimer')?.addEventListener('click', stopTimeTracking);
    document.querySelector('button[onclick="openManualEntryModal()"]')?.setAttribute('id', 'openManualEntryModalBtn');
    document.getElementById('openManualEntryModalBtn')?.addEventListener('click', openManualEntryModal);
    document.querySelector('button[onclick="viewTimeEntries()"]')?.setAttribute('id', 'viewTimeEntriesBtn');
    document.getElementById('viewTimeEntriesBtn')?.addEventListener('click', viewTimeEntries);


    // Projekte Karte
    document.querySelector('button[onclick="viewProjects()"]')?.setAttribute('id', 'viewProjectsBtn');
    document.getElementById('viewProjectsBtn')?.addEventListener('click', viewProjects);
    document.getElementById('createProjectBtn')?.addEventListener('click', openCreateProjectModal);

    // Abwesenheiten Karte
    document.querySelector('button[onclick="viewAbsences()"]')?.setAttribute('id', 'viewAbsencesBtn');
    document.getElementById('viewAbsencesBtn')?.addEventListener('click', viewAbsences);
    document.querySelector('button[onclick="openCreateAbsenceModal()"]')?.setAttribute('id', 'openCreateAbsenceModalBtn');
    document.getElementById('openCreateAbsenceModalBtn')?.addEventListener('click', openCreateAbsenceModal);
    document.getElementById('viewPendingAbsencesBtn')?.addEventListener('click', viewPendingAbsencesForApproval);
    document.getElementById('viewTeamOrAllApprovedAbsencesBtn')?.addEventListener('click', viewTeamOrAllApprovedAbsencesHandler);


    // Admin Panel Buttons
    document.querySelector('button[onclick="viewUsers()"]')?.setAttribute('id', 'viewUsersBtn');
    document.getElementById('viewUsersBtn')?.addEventListener('click', viewUsers);
    document.querySelector('button[onclick="openCreateUserModal()"]')?.setAttribute('id', 'openCreateUserModalBtn');
    document.getElementById('openCreateUserModalBtn')?.addEventListener('click', openCreateUserModal);
    document.getElementById('viewRegistrationRequestsBtn')?.addEventListener('click', viewRegistrationRequests);
    document.querySelector('button[onclick="viewSystemLogs()"]')?.setAttribute('id', 'viewSystemLogsBtn');
    document.getElementById('viewSystemLogsBtn')?.addEventListener('click', viewSystemLogs);
    document.querySelector('button[onclick="debugToken()"]')?.setAttribute('id', 'debugTokenBtn');
    document.getElementById('debugTokenBtn')?.addEventListener('click', debugToken);
    document.querySelector('button[onclick="checkSystemStatus()"]')?.setAttribute('id', 'checkSystemStatusBtn');
    document.getElementById('checkSystemStatusBtn')?.addEventListener('click', checkSystemStatus);


    // Data Display Schließen Button
    const closeDataDisplayBtn = document.querySelector('#dataDisplay .btn-secondary[onclick="hideDataDisplay()"]');
    if(closeDataDisplayBtn) {
        closeDataDisplayBtn.removeAttribute('onclick'); // Altes onclick entfernen
        closeDataDisplayBtn.addEventListener('click', hideDataDisplay);
    }

    // Formular-Listener für Modals
    document.getElementById('manualEntryForm')?.addEventListener('submit', handleManualEntrySubmit);
    document.getElementById('editTimeEntryForm')?.addEventListener('submit', handleEditTimeEntrySubmit);
    document.getElementById('createProjectForm')?.addEventListener('submit', handleCreateProjectSubmit);
    document.getElementById('createAbsenceForm')?.addEventListener('submit', handleCreateAbsenceSubmit);
    document.getElementById('editAbsenceForm')?.addEventListener('submit', handleEditAbsenceSubmit);
    document.getElementById('editProjectForm')?.addEventListener('submit', handleEditProjectSubmit);
    document.getElementById('deleteProjectBtn')?.addEventListener('click', handleDeleteProject);
    document.getElementById('createUserForm')?.addEventListener('submit', handleCreateUserSubmit);

    // Event Listener für Zeitberechnung im manuellen Eintrag
    document.getElementById('manualStartTime')?.addEventListener('change', calculateWorkTime);
    document.getElementById('manualEndTime')?.addEventListener('change', calculateWorkTime);
    document.getElementById('manualBreakStartTime')?.addEventListener('change', calculateWorkTime);
    document.getElementById('manualBreakEndTime')?.addEventListener('change', calculateWorkTime);

    // Event Listener für Start-/Enddatum bei Abwesenheiten
    const startDateAbsence = document.getElementById('startDate');
    if (startDateAbsence) {
        startDateAbsence.addEventListener('change', function() {
            const endDateInput = document.getElementById('endDate');
            if (endDateInput) {
                endDateInput.min = this.value;
                if (endDateInput.value && new Date(endDateInput.value) < new Date(this.value)) {
                    endDateInput.value = this.value;
                }
            }
        });
    }

    // Listener für Benutzerdetails-Modal auf dashboard.html
    const updateUserStatusBtn = document.getElementById('updateUserStatusBtn');
    if (updateUserStatusBtn) {
        updateUserStatusBtn.addEventListener('click', async function() {
            if (!selectedUserForDetails || !selectedUserForDetails.id) {
                showError('Kein Benutzer ausgewählt oder Benutzer-ID fehlt.');
                return;
            }
            const statusSelect = document.getElementById('userStatusSelect');
            if (!statusSelect) {
                showError('Status-Auswahlfeld nicht gefunden.');
                return;
            }
            const newStatus = statusSelect.value;
            try {
                await apiCall(`/api/admin/users/${selectedUserForDetails.id}/status?status=${newStatus}`, { method: 'PATCH' });
                showSuccess(`Status für ${selectedUserForDetails.firstName} ${selectedUserForDetails.lastName} erfolgreich auf ${newStatus} aktualisiert.`);
                // Benutzerdetails neu laden oder zumindest den Status im Modal aktualisieren
                const user = await apiCall(`/api/admin/users/${selectedUserForDetails.id}`);
                if(user) {
                    selectedUserForDetails = user; // selectedUserForDetails aktualisieren
                    document.getElementById('detailUserStatus').textContent = user.status;
                    // Ggf. die Benutzerliste neu laden, falls sie sichtbar ist und den Status anzeigt
                    if (document.getElementById('dataTitle').textContent === 'Alle Benutzer') {
                        viewUsers();
                    }
                }
            } catch (error) {
                showError('Fehler beim Aktualisieren des Status: ' + (error.message || "Unbekannt"));
            }
        });
    }

    const addRoleBtn = document.getElementById('addRoleBtn');
    if (addRoleBtn) {
        addRoleBtn.addEventListener('click', async function() {
            if (!selectedUserForDetails || !selectedUserForDetails.id) {
                showError('Kein Benutzer ausgewählt oder Benutzer-ID fehlt.');
                return;
            }
            const roleSelect = document.getElementById('addRoleSelect');
            if (!roleSelect) {
                showError('Rollen-Auswahlfeld nicht gefunden.');
                return;
            }
            const roleName = roleSelect.value;
            if (!roleName) {
                showError('Bitte wählen Sie eine Rolle zum Hinzufügen aus.');
                return;
            }
            try {
                await apiCall(`/api/admin/users/${selectedUserForDetails.id}/roles?roleName=${roleName}`, { method: 'POST' });
                showSuccess(`Rolle ${roleName} erfolgreich zu ${selectedUserForDetails.firstName} ${selectedUserForDetails.lastName} hinzugefügt.`);
                // Benutzerdetails neu laden, um die aktualisierte Rollenliste anzuzeigen
                const user = await apiCall(`/api/admin/users/${selectedUserForDetails.id}`);
                if(user) {
                    selectedUserForDetails = user; // selectedUserForDetails aktualisieren

                    await loadRolesForAddDropdown(user.roles || []);
                    // Benutzerliste neu laden
                    if (document.getElementById('dataTitle').textContent === 'Alle Benutzer') {
                        viewUsers();
                    }
                    document.getElementById('userRolesList').innerHTML = (user.roles.map(r => `<span class="user-role-tag">${String(r).replace('ROLE_', '')} <button class="remove-role-btn" data-role="${r}" onclick="handleRemoveRole('${r}')">&times;</button></span>`).join(' ') || 'Keine Rollen');
                }
            } catch (error) {
                showError('Fehler beim Hinzufügen der Rolle: ' + (error.message || "Unbekannt"));
            }
        });
    }

    // Hinzufügen eines Event-Listeners für den "Passwort zurücksetzen"-Button, falls noch nicht vorhanden
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    if (resetPasswordBtn && !resetPasswordBtn.getAttribute('data-listener-attached')) {
        resetPasswordBtn.addEventListener('click', async function() {
            if (!selectedUserForDetails || !selectedUserForDetails.id) {
                showError('Kein Benutzer ausgewählt oder Benutzer-ID fehlt.');
                return;
            }
            if (confirm(`Möchten Sie das Passwort für ${selectedUserForDetails.firstName} ${selectedUserForDetails.lastName} wirklich zurücksetzen?`)) {
                try {
                    const response = await apiCall(`/api/admin/users/${selectedUserForDetails.id}/reset-password`, { method: 'POST' });
                    alert(`✅ Passwort zurückgesetzt. Temporäres Passwort für ${selectedUserForDetails.firstName} ${selectedUserForDetails.lastName}: ${response.temporaryPassword}`);
                } catch (error) {
                    showError('Fehler beim Zurücksetzen des Passworts: ' + (error.message || "Unbekannt"));
                }
            }
        });
        resetPasswordBtn.setAttribute('data-listener-attached', 'true');
    }

    const duplicateInfoModal = document.getElementById('duplicateInfoModal');
    if (duplicateInfoModal) {
        duplicateInfoModal.querySelector('button[onclick^="viewTimeEntries()"]')?.addEventListener('click', function() {
            viewTimeEntries();
            closeModal('duplicateInfoModal');
        });
        duplicateInfoModal.querySelector('button[onclick^="openManualEntryModal()"]')?.addEventListener('click', function() {
            openManualEntryModal(); // Öffnet das Modal für ein anderes Datum
            closeModal('duplicateInfoModal');
        });
        duplicateInfoModal.querySelector('button[onclick^="closeModal(\'duplicateInfoModal\')"]')?.addEventListener('click', function() {
            closeModal('duplicateInfoModal');
        });
    }


    window.addEventListener('click', function(event) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) closeModal(modal.id);
        });
    });

    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-modal-id-to-close');
            if (modalId) {
                closeModal(modalId);
            } else {
                // Fallback: Finde das übergeordnete Modal
                const modal = this.closest('.modal');
                if (modal && modal.id) {
                    closeModal(modal.id);
                }
            }
        });
    });

    const cancelButtons = [
        { id: 'cancelManualEntryBtn', modal: 'manualEntryModal' },
        { id: 'cancelEditTimeEntryBtn', modal: 'editTimeEntryModal' },
        { id: 'cancelCreateProjectBtn', modal: 'createProjectModal' },
        { id: 'cancelCreateAbsenceBtn', modal: 'createAbsenceModal' },
        { id: 'cancelEditAbsenceBtn', modal: 'editAbsenceModal' },
        { id: 'cancelCreateUserBtn', modal: 'createUserModal' },
        { id: 'cancelChangePasswordBtn', modal: 'changePasswordModal' },
        { id: 'closeProjectDetailModalBtn', modal: 'projectDetailModal' },
        { id: 'closeUserDetailModalBtn', modal: 'userDetailModal' },
        { id: 'hideDataDisplayBtn', action: 'hideDataDisplay' } // Spezialfall
    ];

    cancelButtons.forEach(buttonConfig => {
        const button = document.getElementById(buttonConfig.id);
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                if (buttonConfig.modal) {
                    closeModal(buttonConfig.modal);
                } else if (buttonConfig.action === 'hideDataDisplay') {
                    hideDataDisplay();
                }
            });
        }
    });

    const duplicateInfoButtons = [
        { id: 'duplicateInfoViewEntriesBtn', action: () => { viewTimeEntries(); closeModal('duplicateInfoModal'); } },
        { id: 'duplicateInfoChangeDateBtn', action: () => { openManualEntryModal(); closeModal('duplicateInfoModal'); } },
        { id: 'duplicateInfoCloseBtn', action: () => closeModal('duplicateInfoModal') }
    ];

    duplicateInfoButtons.forEach(buttonConfig => {
        const button = document.getElementById(buttonConfig.id);
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                buttonConfig.action();
            });
        }
    });

    document.getElementById('addEditTimeSlotBtn')?.addEventListener('click', function(e) {
        e.preventDefault();
        addEditTimeSlot();
    });

    document.getElementById('addEditBreakSlotBtn')?.addEventListener('click', function(e) {
        e.preventDefault();
        addEditBreakSlot();
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.style.display === 'block') closeModal(modal.id);
            });
            if (document.getElementById('dataDisplay').style.display === 'block') hideDataDisplay();
        }
        // STRG + Enter für Start/Stop Timer
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();

            if (typeof activeTimeEntry !== 'undefined' && activeTimeEntry) {
                stopTimeTracking();
            } else {
                startTimeTracking();
            }
        }
        // STRG + SHIFT + D für Debug Token
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            if(typeof debugToken === 'function') debugToken();
        }
    });
}


async function loadDashboardPageData(forceRefresh = false) {
    console.log('📊 Lade Dashboard-Seiten-Daten...');
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) loadingDiv.style.display = 'block';

    try {
        const cacheBuster = forceRefresh ? `?_t=${Date.now()}` : '';

        const timeEntriesResponse = await apiCall(`/api/time-entries${cacheBuster}`);
        if (timeEntriesResponse && timeEntriesResponse.entries) {
            const today = new Date();
            const todayEntries = timeEntriesResponse.entries.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate.toDateString() === today.toDateString();
            });
            const entryCountEl = document.getElementById('entryCount');
            if (entryCountEl) entryCountEl.textContent = todayEntries.length;

            const totalHoursEl = document.getElementById('totalHours');
            if (totalHoursEl) totalHoursEl.textContent = calculateWeekHoursForDashboard(timeEntriesResponse.entries);
        }

        const projectsResponse = await apiCall(`/api/projects/active${cacheBuster}`);
        if (projectsResponse && projectsResponse.projects) {
            window.projects = projectsResponse.projects;
            const projectCountEl = document.getElementById('projectCount');
            if (projectCountEl) projectCountEl.textContent = window.projects.length;

            populateProjectDropdown(document.getElementById('manualProject'), window.projects);
            populateProjectDropdown(document.getElementById('editProject'), window.projects);

        }

        const absencesResponse = await apiCall(`/api/absences${cacheBuster}`);
        if (absencesResponse && absencesResponse.absences) {
            const pending = absencesResponse.absences.filter(absence => !absence.approved);
            const pendingAbsencesEl = document.getElementById('pendingAbsences');
            if (pendingAbsencesEl) pendingAbsencesEl.textContent = pending.length;
        }

    } catch (error) {
        console.error('❌ Fehler beim Laden der Dashboard-Seiten-Daten:', error);
        showError('Fehler beim Laden der Dashboard-Daten: ' + (error.message || "Unbekannt").replace('DUPLICATE_ENTRY|', ''));
    } finally {
        if (loadingDiv) loadingDiv.style.display = 'none';
    }
}

function calculateWeekHoursForDashboard(entries) {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 (Sonntag) bis 6 (Samstag)

    const diff = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    let totalMinutes = 0;
    if (Array.isArray(entries)) {
        entries.forEach(entry => {
            if (entry && entry.date && entry.actualHours) {
                const entryDate = new Date(entry.date);
                if (entryDate >= weekStart && entryDate <= weekEnd) {
                    totalMinutes += parseTimeToMinutes(entry.actualHours);
                }
            }
        });
    }
    return formatMinutesToHours(totalMinutes);
}

setInterval(() => {

    let isTimerCurrentlyActive = false;
    if (typeof getIsTimerActive === 'function') {
        isTimerCurrentlyActive = getIsTimerActive();
    } else if (typeof activeTimeEntry !== 'undefined') {
        isTimerCurrentlyActive = activeTimeEntry != null;
    }

    if (document.visibilityState === 'visible' && !isTimerCurrentlyActive) {
        loadDashboardPageData();
    }
}, 5 * 60 * 1000);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        console.log('🔧 Service Worker support detected in dashboard.js');

    });
}
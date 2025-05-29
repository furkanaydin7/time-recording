let selectedUserForDetails = null;

async function viewUsers() {
    try {
        const response = await apiCall('/api/admin/users');

        if (response && Array.isArray(response)) {
            displayData('Alle Benutzer', formatUsersTable(response));
        } else {
            displayData('Alle Benutzer', '<p>Keine Benutzer gefunden oder ungültige Antwort.</p>');
        }
    } catch (error) {
        showError('Fehler beim Laden der Benutzer: ' + (error.message || "Unbekannt").replace('DUPLICATE_ENTRY|', ''));
    }
}

async function viewSystemLogs() {

    showError('System-Logs sind noch nicht implementiert.');
}

// Funktion zum anzeigen ausstehender Regestrierungs Anfragen
async function viewRegistrationRequests() {
    try {
        console.log('📋 Lade ausstehende Registrierungsanfragen...');
        hideDataDisplay();
        const response = await apiCall('/api/admin/registration-requests/pending'); // Neuer Endpunkt

        if (response && Array.isArray(response)) {
            if (response.length === 0) {
                displayData('Ausstehende Registrierungsanfragen', '<p>Keine ausstehenden Registrierungsanfragen gefunden.</p>');
            } else {
                displayData('Ausstehende Registrierungsanfragen', formatRegistrationRequestsTable(response));
            }
        } else {
            displayData('Ausstehende Registrierungsanfragen', '<p>Keine Anfragen gefunden oder ungültige Antwort.</p>');
        }
    } catch (error) {
        showError('Fehler beim Laden der Registrierungsanfragen: ' + (error.message || "Unbekannt"));
    }
}

// Funktion zur Formatierung der Tabelle für Registrierungsanfragen
function formatRegistrationRequestsTable(requests) {
    if (!requests || requests.length === 0) {
        return '<p>Keine Registrierungsanfragen gefunden.</p>';
    }

    let tableHtml = `<table class="data-table">
                     <thead>
                       <tr>
                         <th>ID</th>
                         <th>Name</th>
                         <th>E-Mail</th>
                         <th>Angeforderte Rolle</th>
                         <th>Manager</th>
                         <th>Eingereicht am</th>
                         <th>Aktionen</th>
                       </tr>
                     </thead>
                     <tbody>`;

    requests.forEach(request => {
        tableHtml += `<tr>
                      <td>${request.id}</td>
                      <td>${request.firstName} ${request.lastName}</td>
                      <td>${request.email}</td>
                      <td>${request.requestedRole}</td>
                      <td>${request.managerName || '-'}</td>
                      <td>${formatDateTimeDisplay(request.createdAt)}</td>
                      <td class="actions-cell">
                          <button class="btn btn-success btn-small" onclick="approveRegistrationRequest(${request.id})">Genehmigen</button>
                          <button class="btn btn-danger btn-small" onclick="rejectRegistrationRequest(${request.id})" style="margin-left:5px;">Ablehnen</button>
                      </td>
                    </tr>`;
    });
    tableHtml += '</tbody></table>';
    return tableHtml;
}

// Funktion zum Genehmigen einer Registrierungsanfrage
async function approveRegistrationRequest(requestId) {
    if (confirm('Möchten Sie diese Registrierungsanfrage genehmigen und einen Benutzer erstellen?')) {
        try {
            await apiCall(`/api/admin/registration-requests/${requestId}/approve`, { method: 'PATCH' });
            showSuccess('Registrierungsanfrage erfolgreich genehmigt und Benutzer erstellt.');
            viewRegistrationRequests(); // Liste aktualisieren
            loadDashboardPageData(true); // Dashboard-Statistiken aktualisieren
        } catch (error) {
            showError('Fehler beim Genehmigen der Anfrage: ' + (error.message || "Unbekannt"));
        }
    }
}

// Funktion zum Ablehnen einer Registrierungsanfrage
async function rejectRegistrationRequest(requestId) {
    if (confirm('Möchten Sie diese Registrierungsanfrage ablehnen?')) {
        try {
            await apiCall(`/api/admin/registration-requests/${requestId}/reject`, { method: 'PATCH' });
            showSuccess('Registrierungsanfrage erfolgreich abgelehnt.');
            viewRegistrationRequests(); // Liste aktualisieren
            loadDashboardPageData(true); // Dashboard-Statistiken aktualisieren
        } catch (error) {
            showError('Fehler beim Ablehnen der Anfrage: ' + (error.message || "Unbekannt"));
        }
    }
}

function debugToken() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        showError('Kein JWT Token gefunden'); return;
    }
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const tokenInfo = {
            user: payload.sub || payload.email,
            roles: payload.roles || payload.authorities,
            issued: new Date(payload.iat * 1000),
            expires: new Date(payload.exp * 1000),
            isExpired: new Date() > new Date(payload.exp * 1000),
            currentTime: new Date()
        };
        console.log('🔍 Token Info:', tokenInfo);
        if (tokenInfo.isExpired) {
            showError('❌ Token ist abgelaufen! Bitte melden Sie sich neu an.');
        } else {
            const remaining = Math.floor((tokenInfo.expires - tokenInfo.currentTime) / (1000 * 60));
            showSuccess(`✅ Token ist gültig. Läuft ab in ${remaining} Minuten.`);
        }
        return tokenInfo;
    } catch (e) {
        showError('Token ist ungültig oder kann nicht dekodiert werden.');
    }
}

async function checkSystemStatus() {
    try {
        console.log('🔍 Prüfe System-Status...');
        await apiCall('/api/time-entries');
        console.log('✅ API Verbindung OK');
        debugToken(); // Test Token
        showSuccess('✅ System-Status: Alles scheint zu funktionieren.');
    } catch (error) {
        showError('❌ System-Problem: ' + (error.message || "Unbekannt").replace('DUPLICATE_ENTRY|', ''));
    }
}

async function openCreateUserModal() {
    const createUserForm = document.getElementById('createUserForm');
    if (createUserForm) createUserForm.reset();
    document.getElementById('createUserFeedback').style.display = 'none';
    document.getElementById('createUserError').style.display = 'none';

    const newUserRoleSelect = document.getElementById('newUserRole');
    try {
        const allRolesResponse = await apiCall('/api/admin/roles');
        if (newUserRoleSelect) {
            newUserRoleSelect.innerHTML = '';
            if (allRolesResponse && Array.isArray(allRolesResponse)) {
                allRolesResponse.forEach(role => {
                    const option = document.createElement('option');
                    option.value = role.name;
                    option.textContent = String(role.name).replace('ROLE_', '');
                    newUserRoleSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        document.getElementById('createUserError').textContent = 'Fehler beim Laden der Rollen: ' + (error.message || "Unbekannt");
        document.getElementById('createUserError').style.display = 'block';
    }
    openModal('createUserModal');

}
async function showUserDetails(userId) {
    try {
        const user = await apiCall(`/api/admin/users/${userId}`); // apiCall muss global sein
        if (!user) {
            showError('Benutzerdetails nicht gefunden.');
            return;
        }
        selectedUserForDetails = user; // Wichtig für andere Aktionen im Modal

        document.getElementById('detailUserName').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('detailUserEmail').textContent = user.email;
        document.getElementById('detailUserStatus').textContent = user.status || (user.active ? 'Aktiv' : 'Inaktiv');
        document.getElementById('detailUserPlannedHours').textContent = user.plannedHoursPerDay ? user.plannedHoursPerDay.toFixed(1) : 'N/A';
        document.getElementById('detailUserCreatedAt').textContent = formatDateTimeDisplay(user.createdAt); // formatDateTimeDisplay aus uiHelpers.js
        document.getElementById('detailUserUpdatedAt').textContent = formatDateTimeDisplay(user.updatedAt); // formatDateTimeDisplay aus uiHelpers.js

        const userRolesListDiv = document.getElementById('userRolesList');
        if (userRolesListDiv) {
            if (user.roles && user.roles.length > 0) {
                userRolesListDiv.innerHTML = user.roles.map(role =>
                    `<span class="user-role-tag">
                        ${String(role).replace('ROLE_', '')}
                        <button class="remove-role-btn" data-role="${role}" title="Rolle '${String(role).replace('ROLE_', '')}' entfernen" onclick="handleRemoveRole('${role}')">&times;</button>
                    </span>`
                ).join(' ');
            } else {
                userRolesListDiv.innerHTML = 'Keine Rollen zugewiesen.';
            }
        }

        // Dropdown für das Hinzufügen von Rollen vorbereiten
        await loadRolesForAddDropdown(user.roles || []); // loadRolesForAddDropdown muss global sein

        // Status im Dropdown für "Status ändern" setzen
        const userStatusSelect = document.getElementById('userStatusSelect');
        if (userStatusSelect) {
            userStatusSelect.value = user.status || (user.active ? 'ACTIVE' : 'INACTIVE');
        }

        openModal('userDetailModal'); // openModal muss global sein
    } catch (error) {
        showError('Fehler beim Laden der Benutzerdetails: ' + (error.message || "Unbekannt")); // showError muss global sein
    }
}

async function handleRemoveRole(roleName) {
    if (!selectedUserForDetails || !selectedUserForDetails.id) {
        showError('Kein Benutzer ausgewählt oder Benutzer-ID fehlt.');
        return;
    }

    const user = selectedUserForDetails;
    if (confirm(`Möchten Sie die Rolle '${String(roleName).replace('ROLE_', '')}' von ${user.firstName} ${user.lastName} wirklich entfernen?`)) {
        try {
            // API-Aufruf zum Entfernen der Rolle
            // Der Endpoint in AdminController ist DELETE /api/admin/users/{id}/roles?roleName=THE_ROLE_NAME
            await apiCall(`/api/admin/users/${user.id}/roles?roleName=${roleName}`, { method: 'DELETE' });
            showSuccess(`Rolle '${String(roleName).replace('ROLE_', '')}' erfolgreich von ${user.firstName} ${user.lastName} entfernt.`);

            // Benutzerdetails und Rollen im Modal neu laden/aktualisieren
            // Am einfachsten ist es, showUserDetails erneut aufzurufen
            await showUserDetails(user.id);

            // Optional: Wenn die Benutzerliste im Hintergrund (dataDisplay) sichtbar ist und Rollen anzeigt, diese auch aktualisieren
            if (document.getElementById('dataDisplay') && document.getElementById('dataDisplay').style.display === 'block' && document.getElementById('dataTitle') && document.getElementById('dataTitle').textContent === 'Alle Benutzer') {
                viewUsers(); // Lädt die Benutzertabelle neu
            }

        } catch (error) {
            showError('Fehler beim Entfernen der Rolle: ' + (error.message || "Unbekannt"));
            console.error("Fehler beim Entfernen der Rolle:", error);
        }
    }
}

async function loadRolesForAddDropdown(currentUserRoles) {
    try {
        const allRolesResponse = await apiCall('/api/admin/roles'); // apiCall muss global sein
        const addRoleSelect = document.getElementById('addRoleSelect');
        if (!addRoleSelect) return;
        addRoleSelect.innerHTML = '<option value="">Rolle auswählen</option>';

        const currentRoleNamesSet = new Set((currentUserRoles || []).map(r => String(r)));

        if (allRolesResponse && Array.isArray(allRolesResponse)) {
            allRolesResponse.forEach(roleObj => {
                // Zeige nur Rollen, die der Benutzer noch nicht hat
                if (!currentRoleNamesSet.has(roleObj.name)) {
                    const option = document.createElement('option');
                    option.value = roleObj.name; // Sendet den Rollennamen an das Backend
                    option.textContent = String(roleObj.name).replace('ROLE_', '');
                    addRoleSelect.appendChild(option);
                }
            });
        }
    } catch (error) {
        console.error('Fehler beim Laden der Rollen für Dropdown:', error);
        showError('Fehler beim Laden der Rollen für das Hinzufügen-Dropdown: ' + (error.message || "Unbekannt")); // showError muss global sein
    }
}

//async function testDuplicateHandling() {

  //  showWarning('Duplikat-Test wird ausgeführt. Siehe Konsole.');
    // ... (Rest der Logik aus dashboard.html) ...
//}

function initializeAdminFeatures() {
    const userEmail = localStorage.getItem('userEmail');
    const userRolesString = localStorage.getItem('userRoles');
    let userRoles = [];
    try {
        if (userRolesString) userRoles = JSON.parse(userRolesString);
    } catch (e) { console.error('Fehler beim Parsen der Rollen:', e); userRoles = []; }

    let isAdmin = false;
    let isManager = false;
    if (Array.isArray(userRoles)) {
        isAdmin = userRoles.some(role => String(role).toUpperCase() === 'ADMIN' || String(role).toUpperCase() === 'ROLE_ADMIN');
        isManager = userRoles.some(role => String(role).toUpperCase().includes('MANAGER'));
    }

    const adminCard = document.getElementById('adminCard');
    const createProjectBtn = document.getElementById('createProjectBtn');
    const viewPendingAbsencesBtn = document.getElementById('viewPendingAbsencesBtn');
    const viewTeamOrAllApprovedAbsencesBtn = document.getElementById('viewTeamOrAllApprovedAbsencesBtn');

    if (isAdmin) {
        if (adminCard) adminCard.style.display = 'block';
        if (createProjectBtn) createProjectBtn.style.display = 'inline-block';
    } else {
        if (adminCard) adminCard.style.display = 'none';
        if (createProjectBtn) createProjectBtn.style.display = 'none';
    }

    if (isAdmin || isManager) {
        if (viewPendingAbsencesBtn) viewPendingAbsencesBtn.style.display = 'inline-block';
        if (viewTeamOrAllApprovedAbsencesBtn) viewTeamOrAllApprovedAbsencesBtn.style.display = 'inline-block';
    } else {
        if (viewPendingAbsencesBtn) viewPendingAbsencesBtn.style.display = 'none';
        if (viewTeamOrAllApprovedAbsencesBtn) viewTeamOrAllApprovedAbsencesBtn.style.display = 'none';
    }

    if (DEBUG_MODE) {
        console.log('👤 User Info (Admin Check):', { email: userEmail, roles: userRoles, isAdmin: isAdmin });
        const debugInfoDiv = document.getElementById('debugInfo');
        if (debugInfoDiv) debugInfoDiv.style.display = 'block';
    }
}

function debugAdminStatus() { }
function forceShowAdminPanel(){}

async function handleCreateUserSubmit(event) {
    event.preventDefault();
    hideAllMessages();
    const firstName = document.getElementById('newFirstName').value;
    const lastName = document.getElementById('newLastName').value;
    const email = document.getElementById('newEmail').value;
    const role = document.getElementById('newUserRole').value;
    const plannedHours = parseFloat(document.getElementById('newPlannedHours').value);

    const feedbackDiv = document.getElementById('createUserFeedback');
    const errorDiv = document.getElementById('createUserError');
    feedbackDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    const submitBtn = document.getElementById('createUserSubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Erstelle Benutzer...';
    }

    try {

        const userData = {
            firstName: firstName, lastName: lastName, email: email,
            role: role, // Der AdminController erwartet den Rollennamen
            plannedHoursPerDay: plannedHours
        };
        const response = await apiCall('/api/admin/users', {method: 'POST', body: userData});
        if (response && response.id) { // Backend gibt UserResponse zurück
            feedbackDiv.textContent = `✅ Benutzer "${response.firstName} ${response.lastName}" erfolgreich erstellt! Initialpasswort: ${response.temporaryPassword || lastName.toLowerCase()}`;
            feedbackDiv.style.display = 'block';
            document.getElementById('createUserForm').reset();
            setTimeout(() => {
                closeModal('createUserModal');
                viewUsers(); // Benutzerliste aktualisieren
                loadDashboardPageData(true); // Dashboard Stats aktualisieren
            }, 5000);
        } else {
            errorDiv.textContent = '❌ Fehler: Benutzer konnte nicht erstellt werden. Unerwartete Antwort.';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.textContent = '❌ Fehler beim Erstellen des Benutzers: ' + (error.message || "Unbekannt");
        errorDiv.style.display = 'block';
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Benutzer anlegen';
        }
    }
}



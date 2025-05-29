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
        selectedUserForDetails = user;
        document.getElementById('detailUserName').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('detailUserEmail').textContent = user.email;
        // ... (Rest der Logik zum Befüllen des userDetailModal) ...

        await loadRolesForAddDropdown(user.roles || []); // loadRolesForAddDropdown muss global sein
        openModal('userDetailModal'); // openModal muss global sein
    } catch (error) {
        showError('Fehler beim Laden der Benutzerdetails: ' + (error.message || "Unbekannt")); // showError muss global sein
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
    if (Array.isArray(userRoles)) {
        isAdmin = userRoles.some(role => String(role).toUpperCase() === 'ADMIN' || String(role).toUpperCase() === 'ROLE_ADMIN');
    }

    const adminCard = document.getElementById('adminCard');
    const createProjectBtn = document.getElementById('createProjectBtn');

    if (isAdmin) {
        if (adminCard) adminCard.style.display = 'block';
        if (createProjectBtn) createProjectBtn.style.display = 'inline-block';
    } else {
        if (adminCard) adminCard.style.display = 'none';
        if (createProjectBtn) createProjectBtn.style.display = 'none';
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



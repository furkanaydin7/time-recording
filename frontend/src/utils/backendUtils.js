/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

export let formatAbsenceType;
formatAbsenceType = (type) => {
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

export const formatUserRole = (role) => {
    const roleMap = {
        'ADMIN': 'Administrator',
        'ROLE_ADMIN': 'Administrator',
        'MANAGER': 'Manager',
        'ROLE_MANAGER': 'Manager',
        'EMPLOYEE': 'Mitarbeiter',
        'ROLE_EMPLOYEE': 'Mitarbeiter'
    };
    return roleMap[role] || role;
};

export const formatUserStatus = (status) => {
    const statusMap = {
        'ACTIVE': 'Aktiv',
        'INACTIVE': 'Inaktiv',
        'LOCKED': 'Gesperrt',
        'VACATION': 'Im Urlaub'
    };
    return statusMap[status] || status;
};

export const hasRole = (userRoles, requiredRole) => {
    if (!userRoles || !Array.isArray(userRoles)) return false;

    return userRoles.some(role =>
        role === requiredRole ||
        role === `ROLE_${requiredRole}` ||
        (role === 'ROLE_ADMIN' && requiredRole === 'ADMIN') ||
        (role === 'ROLE_MANAGER' && requiredRole === 'MANAGER') ||
        (role === 'ROLE_EMPLOYEE' && requiredRole === 'EMPLOYEE')
    );
};

export const isAdmin = (userRoles) => {
    return hasRole(userRoles, 'ADMIN');
};

export const isManager = (userRoles) => {
    return hasRole(userRoles, 'MANAGER');
};

export const isEmployee = (userRoles) => {
    return hasRole(userRoles, 'EMPLOYEE');
};

// Backend Error Handling
export const handleBackendError = (error) => {
    const message = error.message || error.error || 'Ein Fehler ist aufgetreten';

    // Backend-spezifische Fehlermeldungen übersetzen
    const errorTranslations = {
        'User not found': 'Benutzer nicht gefunden',
        'Invalid credentials': 'Ungültige Anmeldedaten',
        'Access denied': 'Zugriff verweigert',
        'Project not found': 'Projekt nicht gefunden',
        'Time entry not found': 'Zeiteintrag nicht gefunden',
        'Absence not found': 'Abwesenheit nicht gefunden',
        'User is not authorized': 'Keine Berechtigung',
        'Something went wrong': 'Ein Fehler ist aufgetreten'
    };

    return errorTranslations[message] || message;
};
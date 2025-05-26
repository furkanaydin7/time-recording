/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

export const ABSENCE_TYPES = {
    VACATION: 'Urlaub',
    ILLNESS: 'Krankheit',
    HOME_OFFICE: 'Home Office',
    TRAINING: 'Fortbildung',
    PUBLIC_HOLIDAY: 'Feiertag',
    UNPAID_LEAVE: 'Unbezahlter Urlaub',
    SPECIAL_LEAVE: 'Sonderurlaub',
    OTHER: 'Sonstige'
};

export const USER_ROLES = {
    ADMIN: 'Administrator',
    ROLE_ADMIN: 'Administrator', // Backend Variante
    MANAGER: 'Manager',
    ROLE_MANAGER: 'Manager', // Backend Variante
    EMPLOYEE: 'Mitarbeiter',
    ROLE_EMPLOYEE: 'Mitarbeiter' // Backend Variante
};

export const USER_STATUS = {
    ACTIVE: 'Aktiv',
    INACTIVE: 'Inaktiv',
    LOCKED: 'Gesperrt',
    VACATION: 'Im Urlaub'
};

// Backend API Endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    CHANGE_PASSWORD: '/api/users/change-password',
    RESET_PASSWORD: '/api/users/reset-password',

    // Time Entries
    TIME_ENTRIES: '/api/time-entries',
    TIME_ENTRIES_START: '/api/time-entries/start',
    TIME_ENTRIES_STOP: (id) => `/api/time-entries/${id}/stop`,
    TIME_ENTRIES_ASSIGN: (id) => `/api/time-entries/${id}/assign-project`,
    TIME_ENTRIES_USER: (userId) => `/api/time-entries/user/${userId}`,

    // Projects
    PROJECTS: '/api/projects',
    PROJECTS_ACTIVE: '/api/projects/active',
    PROJECTS_SEARCH: '/api/projects/search',
    PROJECTS_USER: (userId) => `/api/projects/user/${userId}`,
    PROJECTS_MANAGER: (managerId) => `/api/projects/manager/${managerId}`,
    PROJECT_DEACTIVATE: (id) => `/api/projects/${id}/deactivate`,
    PROJECT_ACTIVATE: (id) => `/api/projects/${id}/activate`,
    PROJECT_MANAGER: (id) => `/api/projects/${id}/manager`,

    // Absences
    ABSENCES: '/api/absences',
    ABSENCES_PENDING: '/api/absences/pending',
    ABSENCES_APPROVED: '/api/absences/approved',
    ABSENCES_USER: (userId) => `/api/absences/user/${userId}`,
    ABSENCES_TYPE: (type) => `/api/absences/type/${type}`,
    ABSENCES_UPCOMING: (userId) => `/api/absences/user/${userId}/upcoming`,
    ABSENCES_CHECK: '/api/absences/check',
    ABSENCE_APPROVE: (id) => `/api/absences/${id}/approve`,
    ABSENCE_REJECT: (id) => `/api/absences/${id}/reject`,

    // Admin
    ADMIN_USERS: '/api/admin/users',
    ADMIN_USER_SEARCH: '/api/admin/users/search',
    ADMIN_USER_STATUS: (id) => `/api/admin/users/${id}/status`,
    ADMIN_USER_ROLES: (id) => `/api/admin/users/${id}/roles`,
    ADMIN_USER_DEACTIVATE: (id) => `/api/admin/user/${id}/deactivate`,
    ADMIN_USER_ACTIVATE: (id) => `/api/admin/users/${id}/activate`
};

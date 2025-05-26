import apiCall from './apiClient';

/**
 * REST Controller für Administratoren
 * API Endpunkte für Vewaltung von Benutzern
 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

export const login = async (credentials) => {
    // Backend erwartet: { email, password }
    const response = await apiCall('/api/auth/login', {
        method: 'POST',
        body: {
            email: credentials.email,
            password: credentials.password
        },
    });

    // Backend Response: { token: "...", user: { id, name, role } }
    // Erweitern für Frontend-Kompatibilität
    return {
        token: response.token,
        user: {
            id: response.user.id,
            email: credentials.email, // Email nicht im Response, nehmen wir aus Request
            firstName: response.user.name?.split(' ')[0] || '',
            lastName: response.user.name?.split(' ').slice(1).join(' ') || '',
            roles: response.user.role ? [response.user.role] : []
        }
    };
};

export const logout = async (token) => {
    return apiCall('/api/auth/logout', {
        method: 'POST',
        body: token, // Backend erwartet Token als String im Body
    });
};

export const changePassword = async (passwordData) => {
    // Backend Endpoint: /api/users/change-password
    // Backend erwartet: { oldPassword, newPassword }
    return apiCall('/api/users/change-password', {
        method: 'PUT',
        body: {
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword
        },
    });
};

export const resetPassword = async (email) => {
    // Backend Endpoint: /api/users/reset-password
    // Backend erwartet: { email }
    return apiCall('/api/users/reset-password', {
        method: 'POST',
        body: { email },
    });
};

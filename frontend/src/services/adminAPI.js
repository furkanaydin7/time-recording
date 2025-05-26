import apiCall from './apiClient';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

export const getAllUsers = async () => {
    // Backend Endpoint: /api/admin/users (nur für Admins)
    return apiCall('/api/admin/users');
};

export const getUserById = async (id) => {
    // Backend Endpoint: /api/admin/users/{id} (nur für Admins)
    return apiCall(`/api/admin/users/${id}`);
};

export const createUser = async (userData) => {
    // Backend Endpoint: /api/admin/users (nur für Admins)
    // Backend erwartet: { firstName, lastName, email, password, role, plannedHoursPerDay }
    return apiCall('/api/admin/users', {
        method: 'POST',
        body: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            plannedHoursPerDay: userData.plannedHoursPerDay || 8.0
        },
    });
};

export const updateUser = async (id, userData) => {
    // Backend Endpoint: /api/admin/users/{id} (nur für Admins)
    // Backend erwartet: { firstName, lastName, email, plannedHoursPerDay }
    return apiCall(`/api/admin/users/${id}`, {
        method: 'PUT',
        body: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            plannedHoursPerDay: userData.plannedHoursPerDay
        },
    });
};

export const deactivateUser = async (id) => {
    // Backend Endpoint: /api/admin/user/{id}/deactivate (nur für Admins)
    return apiCall(`/api/admin/user/${id}/deactivate`, {
        method: 'PATCH',
    });
};

export const activateUser = async (id) => {
    // Backend Endpoint: /api/admin/users/{id}/activate (nur für Admins)
    return apiCall(`/api/admin/users/${id}/activate`, {
        method: 'DELETE', // Backend nutzt DELETE für activate
    });
};

export const changeUserStatus = async (id, status) => {
    // Backend Endpoint: /api/admin/users/{id}/status (nur für Admins)
    return apiCall(`/api/admin/users/${id}/status?status=${status}`, {
        method: 'PATCH',
    });
};

export const addRoleToUser = async (id, roleName) => {
    // Backend Endpoint: /api/admin/users/{id}/roles (nur für Admins)
    return apiCall(`/api/admin/users/${id}/roles?roleName=${roleName}`, {
        method: 'POST',
    });
};

export const removeRoleFromUser = async (id, roleName) => {
    // Backend Endpoint: /api/admin/users/{id}/roles (nur für Admins)
    return apiCall(`/api/admin/users/${id}/roles?roleName=${roleName}`, {
        method: 'DELETE',
    });
};

export const searchUsers = async (searchTerm) => {
    // Backend Endpoint: /api/admin/users/search?searchTerm={searchTerm} (nur für Admins)
    return apiCall(`/api/admin/users/search?searchTerm=${encodeURIComponent(searchTerm)}`);
};

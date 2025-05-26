import apiCall from './apiClient';

/**
 *
 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

export const getActiveProjects = async () => {
    // Backend Endpoint: /api/projects/active
    // Backend Response: { projects: [...] }
    const response = await apiCall('/api/projects/active');
    return response.projects || [];
};

export const getAllProjects = async () => {
    // Backend Endpoint: /api/projects (nur für Admins)
    // Backend Response: { projects: [...] }
    const response = await apiCall('/api/projects');
    return response.projects || [];
};

export const getProjectById = async (id) => {
    // Backend Endpoint: /api/projects/{id}
    return apiCall(`/api/projects/${id}`);
};

export const createProject = async (projectData) => {
    // Backend Endpoint: /api/projects (nur für Admins)
    // Backend erwartet: { name, description, managerId }
    // Backend Response: { id, message }
    return apiCall('/api/projects', {
        method: 'POST',
        body: {
            name: projectData.name,
            description: projectData.description,
            managerId: projectData.managerId || null
        },
    });
};

export const updateProject = async (id, projectData) => {
    // Backend Endpoint: /api/projects/{id}
    // Backend erwartet: { name, description, managerId }
    return apiCall(`/api/projects/${id}`, {
        method: 'PUT',
        body: {
            name: projectData.name,
            description: projectData.description,
            managerId: projectData.managerId || null
        },
    });
};

export const deactivateProject = async (id) => {
    // Backend Endpoint: /api/projects/{id}/deactivate (nur für Admins)
    return apiCall(`/api/projects/${id}/deactivate`, {
        method: 'PATCH',
    });
};

export const activateProject = async (id) => {
    // Backend Endpoint: /api/projects/{id}/activate (nur für Admins)
    return apiCall(`/api/projects/${id}/activate`, {
        method: 'PATCH',
    });
};

export const assignManager = async (projectId, managerId) => {
    // Backend Endpoint: /api/projects/{id}/manager (nur für Admins)
    // Backend erwartet: { managerId }
    return apiCall(`/api/projects/${projectId}/manager`, {
        method: 'POST',
        body: { managerId },
    });
};

export const removeManager = async (projectId) => {
    // Backend Endpoint: /api/projects/{id}/manager (nur für Admins)
    return apiCall(`/api/projects/${projectId}/manager`, {
        method: 'DELETE',
    });
};

export const searchProjects = async (searchTerm) => {
    // Backend Endpoint: /api/projects/search?term=suchbegriff
    // Backend Response: { projects: [...] }
    const response = await apiCall(`/api/projects/search?term=${encodeURIComponent(searchTerm)}`);
    return response.projects || [];
};

export const getProjectsByUserId = async (userId) => {
    // Backend Endpoint: /api/projects/user/{userId}
    // Backend Response: { projects: [...] }
    const response = await apiCall(`/api/projects/user/${userId}`);
    return response.projects || [];
};

export const getActiveProjectsByUserId = async (userId) => {
    // Backend Endpoint: /api/projects/user/{userId}/active
    // Backend Response: { projects: [...] }
    const response = await apiCall(`/api/projects/user/${userId}/active`);
    return response.projects || [];
};

export const getProjectsByManagerId = async (managerId) => {
    // Backend Endpoint: /api/projects/manager/{managerId}
    // Backend Response: { projects: [...] }
    const response = await apiCall(`/api/projects/manager/${managerId}`);
    return response.projects || [];
};

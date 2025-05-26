import apiCall from './apiClient';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

export const getCurrentUserTimeEntries = async () => {
    // Backend Endpoint: /api/time-entries
    // Backend Response: { entries: [...] }
    const response = await apiCall('/api/time-entries');
    return response.entries || [];
};

export const createTimeEntry = async (entryData) => {
    // Backend Endpoint: /api/time-entries
    // Backend erwartet: { date, startTimes, endTimes, breaks, projectId }
    return apiCall('/api/time-entries', {
        method: 'POST',
        body: {
            date: entryData.date,
            startTimes: entryData.startTimes,
            endTimes: entryData.endTimes,
            breaks: entryData.breaks || [],
            projectId: entryData.projectId
        },
    });
};

export const updateTimeEntry = async (id, entryData) => {
    // Backend Endpoint: /api/time-entries/{id}
    return apiCall(`/api/time-entries/${id}`, {
        method: 'PUT',
        body: {
            date: entryData.date,
            startTimes: entryData.startTimes,
            endTimes: entryData.endTimes,
            breaks: entryData.breaks || [],
            projectId: entryData.projectId
        },
    });
};

export const deleteTimeEntry = async (id) => {
    // Backend Endpoint: /api/time-entries/{id} (nur für Admins)
    return apiCall(`/api/time-entries/${id}`, {
        method: 'DELETE',
    });
};

export const startTimeTracking = async (projectId) => {
    // Backend Endpoint: /api/time-entries/start
    // Backend erwartet: { projectId } (optional)
    return apiCall('/api/time-entries/start', {
        method: 'POST',
        body: projectId ? { projectId } : {},
    });
};

export const stopTimeTracking = async (entryId) => {
    // Backend Endpoint: /api/time-entries/{entryId}/stop
    return apiCall(`/api/time-entries/${entryId}/stop`, {
        method: 'POST',
    });
};

export const assignProject = async (entryId, projectId) => {
    // Backend Endpoint: /api/time-entries/{id}/assign-project
    // Backend erwartet: { projectId }
    return apiCall(`/api/time-entries/${entryId}/assign-project`, {
        method: 'POST',
        body: { projectId },
    });
};

export const getUserTimeEntries = async (userId) => {
    // Backend Endpoint: /api/time-entries/user/{userId} (nur für Admins)
    return apiCall(`/api/time-entries/user/${userId}`);
};

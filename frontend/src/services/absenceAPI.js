import apiCall from './apiClient';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

export const getCurrentUserAbsences = async () => {
    // Backend Endpoint: /api/absences
    // Backend Response: { absences: [...] }
    const response = await apiCall('/api/absences');
    return response.absences || [];
};

export const createAbsence = async (absenceData) => {
    // Backend Endpoint: /api/absences
    // Backend erwartet: { startDate, endDate, type }
    // Backend Response: { id, message }
    return apiCall('/api/absences', {
        method: 'POST',
        body: {
            startDate: absenceData.startDate,
            endDate: absenceData.endDate,
            type: absenceData.type
        },
    });
};

export const updateAbsence = async (id, absenceData) => {
    // Backend Endpoint: /api/absences/{id}
    // Backend erwartet: { startDate, endDate, type }
    return apiCall(`/api/absences/${id}`, {
        method: 'PUT',
        body: {
            startDate: absenceData.startDate,
            endDate: absenceData.endDate,
            type: absenceData.type
        },
    });
};

export const deleteAbsence = async (id) => {
    // Backend Endpoint: /api/absences/{id}
    return apiCall(`/api/absences/${id}`, {
        method: 'DELETE',
    });
};

export const getPendingAbsences = async () => {
    // Backend Endpoint: /api/absences/pending (nur für Manager/Admin)
    // Backend Response: { absences: [...] }
    const response = await apiCall('/api/absences/pending');
    return response.absences || [];
};

export const getApprovedAbsences = async () => {
    // Backend Endpoint: /api/absences/approved (nur für Admins)
    // Backend Response: { absences: [...] }
    const response = await apiCall('/api/absences/approved');
    return response.absences || [];
};

export const approveAbsence = async (id) => {
    // Backend Endpoint: /api/absences/{id}/approve (nur für Manager/Admin)
    // Backend Response: { approved: true, message }
    return apiCall(`/api/absences/${id}/approve`, {
        method: 'PATCH',
    });
};

export const rejectAbsence = async (id) => {
    // Backend Endpoint: /api/absences/{id}/reject (nur für Manager/Admin)
    return apiCall(`/api/absences/${id}/reject`, {
        method: 'PATCH',
    });
};

export const getUserAbsences = async (userId) => {
    // Backend Endpoint: /api/absences/user/{userId} (nur für Admins)
    // Backend Response: { absences: [...] }
    const response = await apiCall(`/api/absences/user/${userId}`);
    return response.absences || [];
};

export const getAbsencesByType = async (type) => {
    // Backend Endpoint: /api/absences/type/{type} (nur für Admins)
    // Backend Response: { absences: [...] }
    const response = await apiCall(`/api/absences/type/${type}`);
    return response.absences || [];
};

export const getUpcomingAbsences = async (userId) => {
    // Backend Endpoint: /api/absences/user/{userId}/upcoming
    // Backend Response: { absences: [...] }
    const response = await apiCall(`/api/absences/user/${userId}/upcoming`);
    return response.absences || [];
};

export const checkAbsenceOnDate = async (userId, date) => {
    // Backend Endpoint: /api/absences/check?userId={userId}&date={date} (nur für Admins)
    // Backend Response: { hasAbsence: boolean }
    const response = await apiCall(`/api/absences/check?userId=${userId}&date=${date}`);
    return response.hasAbsence || false;
};


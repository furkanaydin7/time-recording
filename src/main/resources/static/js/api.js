//@author EK
const API_BASE = 'http://localhost:8080/api';

async function api(path, method = 'GET', data = null) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    };

    const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        ...(data ? { body: JSON.stringify(data) } : {})
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
        throw new Error(errorData.error || 'Fehler bei API-Anfrage');
    }

    return response.status === 204 ? {} : await response.json();
}

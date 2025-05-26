/**
 * Zentraler HTTP Client für API-Kommunikation
 * Handles JWT Authentication und Error Handling
 * @author EK
 * @version 2.0 - Bereinigt, nur HTTP Client ohne redundante APIs
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/**
 * Zentraler API Client für alle HTTP-Requests
 * @param {string} endpoint - API Endpoint (z.B. '/api/auth/login')
 * @param {Object} options - Fetch Options (method, body, etc.)
 * @returns {Promise} - Promise mit Response Data
 */
const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;
    const token = localStorage.getItem('jwt_token');

    // Default Configuration
    const config = {
        headers: {
            'Content-Type': 'application/json',
            // JWT Token automatisch hinzufügen falls vorhanden
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...options,
    };

    // Body automatisch zu JSON konvertieren
    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);

        // Error Handling
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Backend-spezifische Fehlermeldungen
            const errorMessage = errorData.message ||
                errorData.error ||
                `HTTP ${response.status}: ${response.statusText}`;

            throw new Error(errorMessage);
        }

        // 204 No Content Handling
        if (response.status === 204) {
            return {};
        }

        // JSON Response zurückgeben
        return response.json();

    } catch (error) {
        // Network/Fetch Errors
        if (error.name === 'TypeError' || error.name === 'NetworkError') {
            throw new Error('Netzwerkfehler: Server nicht erreichbar');
        }

        // Backend Errors weiterwerfen
        throw error;
    }
};

// Helper Functions für Token Management
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('jwt_token', token);
    } else {
        localStorage.removeItem('jwt_token');
    }
};

export const getAuthToken = () => {
    return localStorage.getItem('jwt_token');
};

export const clearAuthToken = () => {
    localStorage.removeItem('jwt_token');
};

// Default Export des API Clients
export default apiCall;
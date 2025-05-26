import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authAPI from '../services/authAPI';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('jwt_token'));

    useEffect(() => {
        if (token) {
            // Versuche Benutzer aus Token zu extrahieren
            try {
                const userData = parseTokenPayload(token);
                setUser(userData);
            } catch (error) {
                console.error('Token parsing failed:', error);
                logout();
            }
        }
        setLoading(false);
    }, [token]);

    const parseTokenPayload = (token) => {
        try {
            // Vereinfachte Token-Parsing für Demo
            // In einer echten Anwendung würde hier JWT dekodiert werden
            const parts = token.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                return {
                    id: payload.sub,
                    email: payload.email || payload.username,
                    firstName: payload.firstName || payload.given_name || '',
                    lastName: payload.lastName || payload.family_name || '',
                    roles: payload.roles || payload.authorities || []
                };
            }
            throw new Error('Invalid token format');
        } catch (error) {
            // Fallback: verwenden Demo-User basierend auf Token
            return {
                id: 1,
                email: 'demo@timerecording.ch',
                firstName: 'Demo',
                lastName: 'User',
                roles: ['EMPLOYEE']
            };
        }
    };

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            const { token, user } = response;

            localStorage.setItem('jwt_token', token);
            setToken(token);
            setUser(user);

            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await authAPI.logout(token);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('jwt_token');
            setToken(null);
            setUser(null);
        }
    };

    const changePassword = async (passwordData) => {
        try {
            await authAPI.changePassword(passwordData);
        } catch (error) {
            throw error;
        }
    };

    const resetPassword = async (email) => {
        try {
            await authAPI.resetPassword(email);
        } catch (error) {
            throw error;
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        changePassword,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
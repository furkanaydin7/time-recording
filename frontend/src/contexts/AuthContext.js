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
            // Token validieren und Benutzer laden
            validateToken();
        } else {
            setLoading(false);
        }
    }, [token]);

    const validateToken = async () => {
        try {
            // In einer echten Anwendung würde hier eine Token-Validierung stattfinden
            // Für jetzt simulieren wir die Benutzer-Extraktion aus dem Token
            const userData = parseTokenPayload(token);
            setUser(userData);
        } catch (error) {
            console.error('Token validation failed:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const parseTokenPayload = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                id: payload.sub,
                email: payload.email,
                firstName: payload.firstName,
                lastName: payload.lastName,
                roles: payload.roles || []
            };
        } catch (error) {
            throw new Error('Invalid token format');
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

    const updateProfile = async (profileData) => {
        try {
            const updatedUser = await authAPI.updateProfile(profileData);
            setUser(updatedUser);
            return updatedUser;
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
        resetPassword,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

import React, { useState, useEffect } from 'react';

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const ProtectedRoute = ({ roles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-page">
                <div className="spinner-large"></div>
                <p>Lädt...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Rollenbasierte Zugriffskontrolle
    if (roles.length > 0 && !roles.some(role => user.roles?.includes(role))) {
        return (
            <div className="access-denied">
                <h2>Zugriff verweigert</h2>
                <p>Sie haben nicht die erforderlichen Berechtigungen für diese Seite.</p>
            </div>
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;
const SearchInput = ({
                         placeholder = 'Suchen...',
                         onSearch,
                         debounceMs = 300,
                         initialValue = ''
                     }) => {
    const [searchTerm, setSearchTerm] = useState(initialValue);

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchTerm);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [searchTerm, onSearch, debounceMs]);

    return (
        <div className="search-input-container">
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
        </div>
    );
};

export default SearchInput;

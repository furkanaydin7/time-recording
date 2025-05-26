import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TimeEntryProvider } from './contexts/TimeEntryContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { AbsenceProvider } from './contexts/AbsenceContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TimeEntryPage from './pages/TimeEntryPage';
import ProfilePage from './pages/ProfilePage';
import AbsencePage from './pages/AbsencePage';
import NotFoundPage from './pages/NotFoundPage';

// Styles
import './styles/global.css';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Protected Routes */}
                        <Route path="/" element={<ProtectedRoute />}>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route element={<Layout />}>
                                <Route path="/dashboard" element={
                                    <TimeEntryProvider>
                                        <ProjectProvider>
                                            <AbsenceProvider>
                                                <DashboardPage />
                                            </AbsenceProvider>
                                        </ProjectProvider>
                                    </TimeEntryProvider>
                                } />

                                <Route path="/time-entries/*" element={
                                    <TimeEntryProvider>
                                        <ProjectProvider>
                                            <TimeEntryPage />
                                        </ProjectProvider>
                                    </TimeEntryProvider>
                                } />

                                <Route path="/profile" element={<ProfilePage />} />

                                <Route path="/absences/*" element={
                                    <AbsenceProvider>
                                        <AbsencePage />
                                    </AbsenceProvider>
                                } />

                                {/* Admin Routes würden hier hinzugefügt */}

                                <Route path="*" element={<NotFoundPage />} />
                            </Route>
                        </Route>
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as timeEntryAPI from '../services/timeEntryAPI';
import { useAuth } from './AuthContext';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const TimeEntryContext = createContext();

export const useTimeEntries = () => {
    const context = useContext(TimeEntryContext);
    if (!context) {
        throw new Error('useTimeEntries must be used within a TimeEntryProvider');
    }
    return context;
};

export const TimeEntryProvider = ({ children }) => {
    const { token } = useAuth();
    const [timeEntries, setTimeEntries] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            fetchTimeEntries();
        }
    }, [token]);

    const fetchTimeEntries = async () => {
        setLoading(true);
        try {
            const entries = await timeEntryAPI.getCurrentUserTimeEntries();
            setTimeEntries(entries);
        } catch (error) {
            console.error('Error fetching time entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const createTimeEntry = async (entryData) => {
        try {
            const newEntry = await timeEntryAPI.createTimeEntry(entryData);
            setTimeEntries(prev => [newEntry, ...prev]);
            return newEntry;
        } catch (error) {
            throw error;
        }
    };

    const updateTimeEntry = async (id, entryData) => {
        try {
            await timeEntryAPI.updateTimeEntry(id, entryData);
            await fetchTimeEntries(); // Refresh list
        } catch (error) {
            throw error;
        }
    };

    const deleteTimeEntry = async (id) => {
        try {
            await timeEntryAPI.deleteTimeEntry(id);
            setTimeEntries(prev => prev.filter(entry => entry.id !== id));
        } catch (error) {
            throw error;
        }
    };

    const startTimeTracking = async (projectId = null) => {
        try {
            const entry = await timeEntryAPI.startTimeTracking(projectId);
            await fetchTimeEntries(); // Refresh list
            return entry;
        } catch (error) {
            throw error;
        }
    };

    const stopTimeTracking = async (entryId) => {
        try {
            await timeEntryAPI.stopTimeTracking(entryId);
            await fetchTimeEntries(); // Refresh list
        } catch (error) {
            throw error;
        }
    };

    const getActiveEntry = async () => {
        try {
            // Finde aktiven Eintrag (mehr Start- als Endzeiten)
            const activeEntry = timeEntries.find(entry =>
                entry.startTimes?.length > (entry.endTimes?.length || 0)
            );
            return activeEntry || null;
        } catch (error) {
            console.error('Error getting active entry:', error);
            return null;
        }
    };

    const assignProject = async (entryId, projectId) => {
        try {
            await timeEntryAPI.assignProject(entryId, projectId);
            await fetchTimeEntries(); // Refresh list
        } catch (error) {
            throw error;
        }
    };

    const value = {
        timeEntries,
        loading,
        createTimeEntry,
        updateTimeEntry,
        deleteTimeEntry,
        startTimeTracking,
        stopTimeTracking,
        getActiveEntry,
        assignProject,
        fetchTimeEntries
    };

    return (
        <TimeEntryContext.Provider value={value}>
            {children}
        </TimeEntryContext.Provider>
    );
};

// contexts/ProjectContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as projectAPI from '../services/projectAPI';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
};

export const ProjectProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            fetchProjects();
        }
    }, [token]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const projectList = await projectAPI.getActiveProjects();
            setProjects(projectList);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const createProject = async (projectData) => {
        try {
            const newProject = await projectAPI.createProject(projectData);
            setProjects(prev => [newProject, ...prev]);
            return newProject;
        } catch (error) {
            throw error;
        }
    };

    const updateProject = async (id, projectData) => {
        try {
            await projectAPI.updateProject(id, projectData);
            await fetchProjects(); // Refresh list
        } catch (error) {
            throw error;
        }
    };

    const deactivateProject = async (id) => {
        try {
            await projectAPI.deactivateProject(id);
            await fetchProjects(); // Refresh list
        } catch (error) {
            throw error;
        }
    };

    const activateProject = async (id) => {
        try {
            await projectAPI.activateProject(id);
            await fetchProjects(); // Refresh list
        } catch (error) {
            throw error;
        }
    };

    const assignManager = async (projectId, managerId) => {
        try {
            await projectAPI.assignManager(projectId, managerId);
            await fetchProjects(); // Refresh list
        } catch (error) {
            throw error;
        }
    };

    const removeManager = async (projectId) => {
        try {
            await projectAPI.removeManager(projectId);
            await fetchProjects(); // Refresh list
        } catch (error) {
            throw error;
        }
    };

    const searchProjects = async (searchTerm) => {
        try {
            const results = await projectAPI.searchProjects(searchTerm);
            return results;
        } catch (error) {
            throw error;
        }
    };

    const getUserProjects = async (userId) => {
        try {
            const userProjects = await projectAPI.getProjectsByUserId(userId);
            return userProjects;
        } catch (error) {
            throw error;
        }
    };

    const value = {
        projects,
        loading,
        createProject,
        updateProject,
        deactivateProject,
        activateProject,
        assignManager,
        removeManager,
        searchProjects,
        getUserProjects,
        fetchProjects
    };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
};

// contexts/AbsenceContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as absenceAPI from '../services/absenceAPI';
import { useAuth } from './AuthContext';

const AbsenceContext = createContext();

export const useAbsences = () => {
    const context = useContext(AbsenceContext);
    if (!context) {
        throw new Error('useAbsences must be used within an AbsenceProvider');
    }
    return context;
};

export const AbsenceProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [absences, setAbsences] = useState([]);
    const [pendingAbsences, setPendingAbsences] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            fetchAbsences();
            if (user?.roles?.some(role => ['ADMIN', 'MANAGER'].includes(role))) {
                fetchPendingAbsences();
            }
        }
    }, [token, user]);

    const fetchAbsences = async () => {
        setLoading(true);
        try {
            const userAbsences = await absenceAPI.getCurrentUserAbsences();
            setAbsences(userAbsences);
        } catch (error) {
            console.error('Error fetching absences:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingAbsences = async () => {
        try {
            const pending = await absenceAPI.getPendingAbsences();
            setPendingAbsences(pending);
        } catch (error) {
            console.error('Error fetching pending absences:', error);
        }
    };

    const createAbsence = async (absenceData) => {
        try {
            const newAbsence = await absenceAPI.createAbsence(absenceData);
            setAbsences(prev => [newAbsence, ...prev]);
            return newAbsence;
        } catch (error) {
            throw error;
        }
    };

    const updateAbsence = async (id, absenceData) => {
        try {
            await absenceAPI.updateAbsence(id, absenceData);
            await fetchAbsences(); // Refresh list
        } catch (error) {
            throw error;
        }
    };

    const deleteAbsence = async (id) => {
        try {
            await absenceAPI.deleteAbsence(id);
            setAbsences(prev => prev.filter(absence => absence.id !== id));
        } catch (error) {
            throw error;
        }
    };

    const approveAbsence = async (id) => {
        try {
            await absenceAPI.approveAbsence(id);
            await fetchPendingAbsences(); // Refresh pending list
        } catch (error) {
            throw error;
        }
    };

    const rejectAbsence = async (id) => {
        try {
            await absenceAPI.rejectAbsence(id);
            await fetchPendingAbsences(); // Refresh pending list
        } catch (error) {
            throw error;
        }
    };

    const getAbsencesByType = async (type) => {
        try {
            const filteredAbsences = await absenceAPI.getAbsencesByType(type);
            return filteredAbsences;
        } catch (error) {
            throw error;
        }
    };

    const getUpcomingAbsences = async (userId) => {
        try {
            const upcoming = await absenceAPI.getUpcomingAbsences(userId);
            return upcoming;
        } catch (error) {
            throw error;
        }
    };

    const checkAbsenceOnDate = async (userId, date) => {
        try {
            const hasAbsence = await absenceAPI.checkAbsenceOnDate(userId, date);
            return hasAbsence;
        } catch (error) {
            throw error;
        }
    };

    const value = {
        absences,
        pendingAbsences,
        loading,
        createAbsence,
        updateAbsence,
        deleteAbsence,
        approveAbsence,
        rejectAbsence,
        getAbsencesByType,
        getUpcomingAbsences,
        checkAbsenceOnDate,
        fetchAbsences,
        fetchPendingAbsences
    };

    return (
        <AbsenceContext.Provider value={value}>
            {children}
        </AbsenceContext.Provider>
    );
};

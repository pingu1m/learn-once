import { useState, useCallback } from 'react';
import { Session, CreateSessionInput } from '../types';
import { createSession, updateSession, deleteSession } from '../api/sessionApi';

export const useSessionManager = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [editingSession, setEditingSession] = useState<Session | null>(null);

    const fetchSessions = useCallback(async () => {
        const data = await getSessions();
        setSessions(data);
    }, []);

    const createNewSession = useCallback(async (sessionInput: CreateSessionInput) => {
        const newSession = await createSession(sessionInput);
        setSessions((prevSessions) => [...prevSessions, newSession]);
        setEditingSession(newSession);
    }, []);

    const updateExistingSession = useCallback(async (sessionId: number, updates: Partial<Session>) => {
        const updatedSession = await updateSession(sessionId, updates);
        setSessions((prevSessions) =>
            prevSessions.map((session) => (session.id === sessionId ? updatedSession : session))
        );
        setEditingSession(updatedSession);
    }, []);

    const deleteExistingSession = useCallback(async (sessionId: number) => {
        await deleteSession(sessionId);
        setSessions((prevSessions) => prevSessions.filter((session) => session.id !== sessionId));
        setEditingSession(null);
    }, []);

    return {
        sessions,
        editingSession,
        fetchSessions,
        createNewSession,
        updateExistingSession,
        deleteExistingSession,
        setEditingSession,
    };
};
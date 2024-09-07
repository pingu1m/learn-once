// @ts-nocheck
// noteApi.ts
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {invoke} from "@tauri-apps/api/core";
import {Note} from "@/types/Note.ts";
import {Session} from "@/types/Session.ts";

// Fetch all notes using the note_select command
const fetchNotes = async (): Promise<Note[]> => {
    const response = await invoke<string>('note_select');
    return JSON.parse(response);
};

// Fetch all notes using the note_select command
const fetchSessions = async (): Promise<Session[]> => {
    const response = await invoke<string>('session_select');
    return JSON.parse(response);
};

// Delete a note using the note_delete command
const deleteSession = async (id: number): Promise<void> => {
    await invoke<number>('session_delete', {id: id});
};

// Create a new note using the note_insert command
const createNote = (note: Omit<Note, 'id'>): Promise<Note> => {
    // @ts-ignore
    return invoke<string>('note_insert', {note}).then((id) => {
        let result = {...note, id: parseInt(id)}
        // console.log("invoke", result)
        return result;
    })
};

// Update an existing note using the note_update command
const updateNote = async (note: Note): Promise<Note> => {
    // Serialize the note object to a JSON string
    // const temp = {
    //     // label: note.label.join(","),
    //     ...note
    // }
    // const noteJson = JSON.stringify(temp);
    await invoke<number>('note_update', {note: note});
    return note;
};

// Delete a note using the note_delete command
const deleteNote = async (noteId: number): Promise<void> => {
    await invoke<number>('note_delete', {id: noteId});
};

// Fetch a session by its ID
const fetchSessionById = async (sessionId: number): Promise<Session> => {
    const response = await invoke<Session>('start_study_session', {id: sessionId});
    return response
};

// React Query hook to fetch a session by ID
export const useStartSession = (sessionId: number) => {
    return useQuery<Session, Error>({
        queryKey: ['session', sessionId], // Include sessionId in the query key for caching
        queryFn: () => fetchSessionById(sessionId),
        enabled: !!sessionId, // Only fetch if sessionId is valid
    });
};

export const useNotes = () => {
    return useQuery<Note[], Error>({
        queryKey: ['notes'],
        queryFn: fetchNotes
    });
};

export const useSessions = () => {
    return useQuery<Session[], Error>({
        queryKey: ['sessions'],
        queryFn: fetchSessions
    });
};


export const useCreateNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (note: Note) => createNote(note),
        onSuccess: () => {
            queryClient.invalidateQueries(['notes']);
            // navigate here
        },
    });
};

export const useUpdateNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (note: Note) => updateNote(note),
        onSuccess: () => {
            queryClient.invalidateQueries(['notes'])
        },
    });
};

export const useDeleteNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (noteId: number) => deleteNote(noteId),
        onSuccess: () => {
            queryClient.invalidateQueries(['notes']);
        },
    });
};

export const useDeleteSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteSession(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['sessions']);
        },
    });
};

import { useState, useCallback } from 'react';
import { Note, CreateNoteInput } from '../types';
import { createNote, updateNote, deleteNote } from '../api/noteApi';

export const useNoteManager = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    const fetchNotes = useCallback(async () => {
        const data = await getNotes();
        setNotes(data);
    }, []);

    const createNewNote = useCallback(async (noteInput: CreateNoteInput) => {
        const newNote = await createNote(noteInput);
        setNotes((prevNotes) => [...prevNotes, newNote]);
        setEditingNote(newNote);
    }, []);

    const updateExistingNote = useCallback(async (noteId: number, updates: Partial<Note>) => {
        const updatedNote = await updateNote(noteId, updates);
        setNotes((prevNotes) =>
            prevNotes.map((note) => (note.id === noteId ? updatedNote : note))
        );
        setEditingNote(updatedNote);
    }, []);

    const deleteExistingNote = useCallback(async (noteId: number) => {
        await deleteNote(noteId);
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
        setEditingNote(null);
    }, []);

    return {
        notes,
        editingNote,
        fetchNotes,
        createNewNote,
        updateExistingNote,
        deleteExistingNote,
        setEditingNote,
    };
};
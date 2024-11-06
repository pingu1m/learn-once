import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';
import {Note} from "@/types/Note.ts";

interface UseNoteChangesProps {
    initialNote: Note;
    onUpdate: (note: Note) => void;
    autoSaveDelay?: number;
}

export const useNoteChanges = ({
                                   initialNote,
                                   onUpdate,
                                   autoSaveDelay = 5000,
                               }: UseNoteChangesProps) => {
    const [note, setNote] = useState<Note>(initialNote);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const debouncedUpdate = useCallback(
        debounce((updatedNote: Note) => {
            onUpdate(updatedNote);
            setHasUnsavedChanges(false);
        }, autoSaveDelay),
        [onUpdate, autoSaveDelay]
    );

    const handleNoteChange = useCallback((
        key: keyof Note,
        value: string | boolean
    ) => {
        const updatedNote = {
            ...note,
            date: new Date().toISOString(),
            [key]: value,
        };
        setNote(updatedNote);
        setHasUnsavedChanges(true);
        debouncedUpdate(updatedNote);
    }, [note, debouncedUpdate]);

    return {
        note,
        hasUnsavedChanges,
        handleNoteChange,
        setNote,
    };
};
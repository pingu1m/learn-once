import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import useAppStore from '@/store/useAppStore';
import useSettingsStore from '@/store/useSettingsStore';
import { useUpdateNote, useDeleteNote } from '@/components/notes/noteApi';
import {Note} from "@/types/Note.ts";
import {useNoteChanges} from "@/pages/noteEditor/useNoteChanges.ts";
import {NoteToolbar} from "@/pages/noteEditor/NoteToolbar.tsx";
import {MonacoEditor} from "@/pages/noteEditor/MonacoEditor.tsx";

interface NoteDisplayProps {
    editingNote: Note | null;
}

export const NoteDisplay: React.FC<NoteDisplayProps> = ({ editingNote }) => {
    const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false);
    const { settings, loadSettings } = useSettingsStore();
    const { mutate: updateNote } = useUpdateNote();
    const { mutate: deleteNote } = useDeleteNote();
    const setEditingNote = useAppStore(state => state.setEditingNote);

    const {
        note,
        hasUnsavedChanges,
        handleNoteChange,
        setNote,
    } = useNoteChanges({
        initialNote: editingNote,
        onUpdate: updateNote,
        autoSaveDelay: isAutoSaveEnabled ? 5000 : 0,
    });

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    useEffect(() => {
        if (editingNote) {
            setNote(editingNote);
        }
    }, [editingNote, setNote]);

    const createStudySession = async () => {
        if (!note) return;
        try {
            const response = await invoke<string>('create_study_session', { id: note.id });
            console.log("Created study session:", JSON.parse(response));
        } catch (error) {
            console.error("Failed to create study session:", error);
        }
    };

    const handleDeleteNote = () => {
        if (!note) return;
        deleteNote(note.id);
        setEditingNote(null);
    };

    if (!note) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                No note selected
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <NoteToolbar
                note={note}
                hasUnsavedChanges={hasUnsavedChanges}
                onSave={() => updateNote(note)}
                onTitleChange={(value) => handleNoteChange('title', value)}
                onLanguageChange={(value) => handleNoteChange('language', value)}
                onCreateStudySession={createStudySession}
                isAutoSaveEnabled={isAutoSaveEnabled}
                setIsAutoSaveEnabled={setIsAutoSaveEnabled}
                onDeleteNote={handleDeleteNote}
                onToggleFavorite={() => handleNoteChange('favorite', !note.favorite)}
                onToggleGistSync={() => handleNoteChange('gist_sync', !note.gist_sync)}
            />
            <div className="flex flex-1 flex-col p-4">
                <MonacoEditor
                    content={note.text}
                    language={note.language}
                    settings={settings}
                    onChange={(value) => handleNoteChange('text', value)}
                />
            </div>
        </div>
    );
};
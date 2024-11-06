import {useCallback, useMemo, useState} from "react";
import {useCreateNote, useNotes, useSessions} from "@/components/notes/noteApi";
import useAppStore from "@/store/useAppStore";
import format from "date-fns/format";
import {toast} from "react-toastify";

export const useItemsManager = () => {
    const {data: notes, isLoading: notesLoading, isError: notesError} = useNotes();
    const {data: sessions, isLoading: sessionsLoading, isError: sessionsError} = useSessions();
    const [editingNote, setEditingNote] = useAppStore(state => [state.editingNote, state.setEditingNote]);
    const [editingSession, setEditingSession] = useAppStore(state => [state.editingSession, state.setEditingSession]);
    const {data: createdNote, mutate: createNote} = useCreateNote();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("notes");

    const allItems: any[] = useMemo(() => {
        const noteItems = (notes || []).map(note => ({
            ...note,
            type: 'note',
            name: note.title,
            gistSynced: note.gist_sync
        }));

        const sessionItems = (sessions || []).map(session => ({
            ...session,
            type: 'session',
            name: session.title,
            gistSynced: false
        }));

        return [...noteItems, ...sessionItems];
    }, [notes, sessions]);

    const filteredItems = useMemo(() => {
        return allItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allItems, searchTerm]);

    const handleItemClick = useCallback((item: any) => {
        if (item.type === 'note') {
            setActiveTab("notes");
            setEditingNote(item);
            setEditingSession(null);
        } else {
            setActiveTab("session");
            setEditingSession(item);
            setEditingNote(null);
        }
    }, [setActiveTab, setEditingNote, setEditingSession]);

    const handleCreateNote = useCallback(() => {
        let date_sync = format(new Date(), "PPpp")
        let note = {
            id: 0,
            // @ts-ignore
            title: "New Note @ " + date_sync,
            text: `
#Sample Markdown Note with Cards

Card definition below

\`\`\`toml
[[card]]
title = "What is Rust?"
hint = "Programming Language"
description = "A systems programming language focused on safety, speed, and concurrency."
example = "Rust is often used for performance-critical services."
[[card]]
title = "What is ownership in Rust?"
hint = "Memory Management"
description = "A set of rules that governs how a Rust program manages memory."
example = "Ownership ensures memory safety without a garbage collector."
\`\`\`

You can declare more card blocks
`,
            date: new Date().toISOString(),
            favorite: false,
            labels: "",
            language: "markdown",
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            gist_key: "lo",
            gist_sync: false,
        }
        let new_note = createNote(note)
        toast.success("Note created");
        setEditingNote(createdNote)
    }, [createNote, setEditingNote, createdNote]);

    return {
        notes,
        sessions,
        notesLoading,
        sessionsLoading,
        notesError,
        sessionsError,
        editingNote,
        editingSession,
        searchTerm,
        setSearchTerm,
        activeTab,
        setActiveTab,
        filteredItems,
        handleItemClick,
        handleCreateNote
    };
};
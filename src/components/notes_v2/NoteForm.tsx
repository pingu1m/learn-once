import React, { useState } from 'react';
import useNoteStore from "../../store/useNoteStore.ts";

const NoteForm: React.FC = () => {
    const addNote = useNoteStore(state => state.addNote);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!lnag.trim() || !content.trim()) return;
        addNote({ title, content });
        setTitle('');
        setContent('');
    };

    return (
        <>

        </>
    );
};

export default NoteForm;

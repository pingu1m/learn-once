import React from 'react';
import useNoteStore from "../../store/useNoteStore.ts";
import NoteItem from "./NoteItem.tsx";

const NoteList: React.FC = () => {
    const notes = useNoteStore(state => state.notes);

    // Sort notes by 'updated_at' in descending order
    const sortedNotes = notes.slice().sort((a, b) => {
        return new Date(b.updated_at) - new Date(a.updated_at);
    });

    return (
        <ul className="divide-y">
            {sortedNotes.map(note => (
                <NoteItem key={note.id} note={note}/>
            ))}
        </ul>
    )
        ;
};

export default NoteList;

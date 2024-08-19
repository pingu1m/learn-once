import React from 'react';
import useNoteStore from "../../store/useNoteStore.ts";

interface NoteProps {
    note: {
        id: number;
        title: string;
        content: string;
        updated_at: string;
    };
}

const NoteItem: React.FC<NoteProps> = ({ note }) => {
    const setEditingNote = useNoteStore(state => state.setEditingNote);

    return (
            <li className="p-4 cursor-pointer" onClick={() => setEditingNote(note)}>
                <div className="flex justify-between">
                    <h3 className="font-medium">{note.title}</h3>
                    <small className="text-gray-500">{new Date(note.updated_at).toLocaleDateString()}</small>
                </div>
            </li>
            // <li className="p-4">
            //     <div className="flex justify-between">
            //         <h3 className="font-medium">{note.title}</h3>
            //         <small className="text-gray-500">Dec 4, 2023</small>
            //         {/*<button onClick={() => setIsEditing(true)}>Edit</button>*/}
            //         {/*<button onClick={() => deleteNote(note.id)}>Delete</button>*/}
            //     </div>
            // </li>
    );
};

export default NoteItem;

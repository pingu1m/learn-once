import create from 'zustand';
import {notes, Note} from "@/data.tsx";

interface NoteState {
    notes: Note[];
    editingNote: Note | null;
    setEditingNote: (note: Note | null) => void;
    // updateNote: (id: number, updatedNote: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>) => void;
    updateNote: (note: Note) => void;
    addNote: (note: Omit<Note, 'id'>) => void;
    deleteNote: (id: number) => void;
}

let nextId = 3;  // Assuming you start with some dummy data

const useNoteStore = create<NoteState>((set) => ({
    notes: notes
   ,
    editingNote: null,
    setEditingNote: (note) => {
        console.log("set editing note", note);
        set({editingNote: note});
    },

    // updateNote: (id, updatedNote) => {
    //     set(state => ({ notes: state.notes.map(note =>
    //             note.id === id ? { ...note, ...updatedNote, updated_at: new Date().toISOString() } : note
    //         )
    //     }));
    // },
    updateNote: (updatedNote) => {
        set(state => ({
            notes: state.notes.map(note =>
                note.id === updatedNote.id ? {...note, ...updatedNote, updated_at: new Date().toISOString()} : note
            )
        }));
    },

    addNote: (note) => {
        const newNote: Note = {
            ...note,
            id: nextId++,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        set(state => ({
            notes: [...state.notes, newNote],
            editingNote: newNote,
        }));
    },

    deleteNote: (id) => {
        set(state => ({
            notes: state.notes.filter(note => note.id !== id)
        }));
    }
}));

export default useNoteStore;

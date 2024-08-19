import {Note} from "../../types/Note.ts";

const notes: Note[] = [
    { id: 1, title: 'First Note', content: 'This is the first note.' },
    { id: 2, title: 'Second Note', content: 'This is the second note.' }
];

let nextId = 3;

const getNotes = async (): Promise<Note[]> => {
    return notes; // Simulate async operation
};

const getNoteById = async (id: number): Promise<Note | undefined> => {
    const note = notes.find(n => n.id === id);
    return note;
};

const createNote = async (note: Omit<Note, 'id'>): Promise<Note> => {
    const newNote: Note = { ...note, id: nextId++ };
    notes.push(newNote);
    return newNote;
};

const updateNote = async (id: number, updatedNote: Omit<Note, 'id'>): Promise<Note | undefined> => {
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
        notes[index] = { ...updatedNote, id };
        return notes[index];
    }
    return undefined;
};

const deleteNote = async (id: number): Promise<void> => {
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
        notes.splice(index, 1);
    }
};

export { getNotes, getNoteById, createNote, updateNote, deleteNote };

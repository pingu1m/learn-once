import {create} from 'zustand';
import {Note} from "@/types/Note.ts";
import {Session} from "@/types/Session.ts";

interface AppState {
    editingNote: Note | null;
    setEditingNote: (note: Note | null) => void;
    editingSession: Session | null;
    setEditingSession: (session: Session | null) => void;
}

const useAppStore = create<AppState>((set) => ({
    editingNote: null,
    setEditingNote: (note) => {
        console.log("set editing note", note);
        set({editingNote: note});
    },
    editingSession: null,
    setEditingSession: (session) => {
        console.log("set editing session", session);
        set({editingSession: session});
    },
}));

export default useAppStore;

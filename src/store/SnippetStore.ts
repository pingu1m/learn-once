import { create } from "zustand";
import {devtools} from "zustand/middleware";

interface Snippet{
    name: string;
    code: string | null;
}

interface SnippetState {
  snippetName: string[];
  selectedSnippet: Snippet | null;
  setSnippetName: (snippetName: string[]) => void;
  setSelectedSnippet: (snippetName: Snippet | null) => void;
  addSnippet: (snippetName: string) => void;
  removeSnippet: (snippetName: string) => void;
}

export const useSnippetStore = create<SnippetState>()(
    devtools((set) => ({
        snippetName: [],
        selectedSnippet: null,
        setSnippetName: (snippetName) => set({ snippetName }),
        setSelectedSnippet: (snippetName) => set({ selectedSnippet: snippetName }),
        addSnippet: (snippetName) => set((state) => ({ snippetName: [...state.snippetName, snippetName] })),
        removeSnippet: (snippetName) => set((state) => ({ snippetName: state.snippetName.filter((name) => name !== snippetName) })),
    }))
);


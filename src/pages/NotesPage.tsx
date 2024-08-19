import React from 'react';
import useNoteStore from '../store/useNoteStore';
import {Button} from "../components/ui/button.tsx";
import {FolderTreeIcon, SearchIcon} from "../components/dashboard/icons.tsx";
import NoteList from "@/components/notes_v2/NoteList.tsx";
import NoteEditor from "@/components/notes_v2/NoteEditor.tsx";
import {Input} from "../components/ui/input.tsx"; // Ensure the store is correctly imported

export default function NotesPage() {
    const {addNote} = useNoteStore();

    const handleNewNote = () => {
        addNote({
            title: 'New Note',
            content: '#Content Here',
            language: 'markdown',
            tags: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
    };

    // @ts-ignore
    return (
        <>
            <div className="border shadow-sm rounded-lg overflow-auto">
                <div className="flex items-center justify-between px-4 py-2 font-semibold border-b">
                    <h2>All Notes</h2>
                    <div>
                        <Button onClick={handleNewNote} className="mr-2">
                            New Note
                        </Button>
                        <Button size="icon" variant="ghost">
                            <FolderTreeIcon className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
                <NoteList/>
            </div>
            <div>
                <div className="border shadow-sm rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 justify-start">
                        <SearchIcon className="h-5 w-5 text-gray-500"/>
                        <Input
                            type="text"
                            placeholder="Search notes..."
                            className="w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <NoteEditor/>
            </div>

        </>
    );
}

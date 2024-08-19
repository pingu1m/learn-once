// noteApi.ts
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Note} from "@/components/notes/nodeModel.ts";
import {invoke} from "@tauri-apps/api/core";

// Fetch all notes using the note_select command
const fetchNotes = async (): Promise<Note[]> => {
    const response = await invoke<string>('note_select');
    return JSON.parse(response);
};

// Create a new note using the note_insert command
const createNote = async (note: Omit<Note, 'id'>): Promise<Note> => {
    const id = await invoke<number>('note_insert', {note});
    return {...note, id};
};

// Update an existing note using the note_update command
const updateNote = async (note: Note): Promise<Note> => {
    // Serialize the note object to a JSON string
    const temp = {
        // label: note.label.join(","),
        ...note
    }
    // const noteJson = JSON.stringify(temp);
    await invoke<number>('note_update', {note: note});
    return note;
};

// Delete a note using the note_delete command
const deleteNote = async (noteId: number): Promise<void> => {
    await invoke<number>('note_delete', {id: noteId});
};

// export const useUsers = () => {
//     return useQuery({
//         queryKey: ['users'],
//         queryFn: async () => {
//             const { data } = await axios.get(
//                 'https://jsonplaceholder.typicode.com/users'
//             );
//             return data;
//         }
//     });
// }
export const useNotes = () => {
    return useQuery<Note[], Error>({
        queryKey: ['notes'],
        queryFn: fetchNotes
    });
};


export const useCreateNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (note: Note) => createNote(note),
        onSuccess: () => {
            queryClient.invalidateQueries(['notes']);
            // navigate here
        },
    });
};

export const useUpdateNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (note: Note) => updateNote(note),
        onSuccess: () => {
            queryClient.invalidateQueries(['notes']);
        },
    });
};

export const useDeleteNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (noteId: number) => deleteNote(noteId),
        onSuccess: () => {
            queryClient.invalidateQueries(['notes']);
        },
    });
};

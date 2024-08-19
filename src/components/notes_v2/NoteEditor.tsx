import React, {useEffect, useState, useRef} from 'react';
import Editor, {useMonaco} from '@monaco-editor/react';
import {Badge} from "../ui/badge";
import useNoteStore from "../../store/useNoteStore.ts";
import {Note} from "../../types/Note.ts";

const NoteEditor: React.FC = () => {
    const {editingNote, updateNote} = useNoteStore(state => ({
        editingNote: state.editingNote,
        updateNote: state.updateNote,
    }));

    const [note, setNote] = useState(editingNote);
    const [availableTags] = useState(['work', 'personal', 'todo', 'idea']);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const monaco = useMonaco();
    const monacoRef = useRef(null);

    useEffect(() => {
        if (monaco) {
            fetch('/themes/Blackboard.json')
                .then(data => data.json())
                .then(data => {
                    monaco.editor.defineTheme('monokai', data);
                    monaco.editor.setTheme('monokai');
                })
        }
    }, [monaco]);

    useEffect(() => {
        setNote(editingNote);
    }, [editingNote]);

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
                // @ts-ignore
                updateNote({...note, updated_at: new Date().toISOString()});
            }
        };
    }, [note]);

    function handleEditorDidMount(editor, monaco) {
        // setup key bindings before monaco-vim setup
        monacoRef.current = monaco;

        // setup key bindings
        editor.addAction({
            // an unique identifier of the contributed action
            id: "some-unique-id",
            // a label of the action that will be presented to the user
            label: "Some label!",
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],

            // the method that will be executed when the action is triggered.
            run: function (editor) {
                alert("we wanna save something => " + editor.getValue());
                return null;
            }
        });

        // setup monaco-vim
        window.require.config({
            paths: {
                "monaco-vim": "https://unpkg.com/monaco-vim/dist/monaco-vim"
            }
        });

        window.require(["monaco-vim"], function (MonacoVim) {
            const statusNode = document.querySelector(".status-node");
            MonacoVim.initVimMode(editor, statusNode);
        });
    }

    const debounceUpdateNote = (updatedNote: Note) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            updateNote({...updatedNote, updated_at: new Date().toISOString()});
        }, 5000);
    };

    const handleContentChange = (value: string | undefined) => {
        if (value !== undefined) {
            setNote(prevNote => {
                const updatedNote = {...prevNote, content: value};
                debounceUpdateNote(updatedNote as Note);
                return updatedNote;
            });
        }
    };

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = event.target.value;
        setNote(prevNote => {
            const updatedNote = {...prevNote, title: newTitle};
            debounceUpdateNote(updatedNote as Note);
            return updatedNote;
        });
    };

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newLanguage = event.target.value;
        setNote(prevNote => {
            const updatedNote = {...prevNote, language: newLanguage};
            debounceUpdateNote(updatedNote as Note);
            return updatedNote;
        });
    };

    const handleToggleTag = (tag: string) => {
        setNote(prevNote => {
            const updatedTags = prevNote.tags.includes(tag) ? prevNote.tags.filter(t => t !== tag) : [...prevNote.tags, tag];
            const updatedNote = {...prevNote, tags: updatedTags};
            debounceUpdateNote(updatedNote as Note);
            return updatedNote;
        });
    };

    return (
        <div className="border shadow-sm rounded-lg p-4">
            {note && (
                <>
                    {/*<div className="border shadow-sm rounded-lg p-4">*/}
                    <div className="flex items-center justify-between mb-4">
                        <input
                            type="text"
                            value={note.title}
                            onChange={handleTitleChange}
                            placeholder="Note Title"
                            className="w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {/*<input*/}
                        {/*    type="text"*/}
                        {/*    value={note.title}*/}
                        {/*    onChange={handleTitleChange}*/}
                        {/*    className="block w-full p-2 mb-4 border rounded-md"*/}
                        {/*    placeholder="Enter note title"*/}
                        {/*/>*/}
                        <select
                            value={note.language}
                            onChange={handleLanguageChange}
                            className="mb-4 p-2 border rounded-md cursor-pointer"
                        >
                            <option value="markdown">Markdown</option>
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="csharp">C#</option>
                        </select>

                        {/*<Select defaultValue="markdown" className="ml-4 w-32">*/}
                        {/*    <SelectTrigger>*/}
                        {/*        <SelectValue placeholder="Language"/>*/}
                        {/*    </SelectTrigger>*/}
                        {/*    <SelectContent>*/}
                        {/*        <SelectItem value="markdown">Markdown</SelectItem>*/}
                        {/*        <SelectItem value="javascript">JavaScript</SelectItem>*/}
                        {/*        <SelectItem value="python">Python</SelectItem>*/}
                        {/*        <SelectItem value="java">Java</SelectItem>*/}
                        {/*    </SelectContent>*/}
                        {/*</Select>*/}
                    </div>
                    {/*<div className="w-full h-60 p-2 rounded border resize-none mb-4">*/}
                    {/*<NoteEditor/>*/}
                    {/*</div>*/}
                    {/*</div>*/}
                    {/*<h2 className="font-semibold mb-2">{editingNote ? 'Edit Note' : 'New Note'}</h2>*/}
                    <Editor
                        height="70vh"
                        language={note.language}
                        value={note.content}
                        onMount={handleEditorDidMount}
                        onChange={handleContentChange}
                    />
                    <code className="status-node"></code>

                    <div className="flex items-center justify-between mt-4">
                        <div className="ml-4">
                            <p className="font-semibold">Recommended Tags</p>
                            <div className="flex flex-wrap gap-2">
                                {availableTags.map(tag => (
                                    <Badge
                                        key={tag}
                                        onClick={() => handleToggleTag(tag)}
                                        className={`hover:bg-gray-100/50 dark:hover:bg-gray-800/50 ${note.tags.includes(tag) ? 'bg-gray-200' : ''}`}
                                        variant="secondary">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NoteEditor;

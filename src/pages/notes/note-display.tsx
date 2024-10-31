// @ts-nocheck
import format from "date-fns/format"
import {Heart, Save, Trash} from "lucide-react"
import {Note} from "@/data.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import monacoThemes from 'monaco-themes/themes/themelist';
import {Label} from "@/components/ui/label.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {invoke} from "@tauri-apps/api/core";
// import useNoteStore from "@/store/useNoteStore.ts";
import React, {useEffect, useRef, useState} from "react";
import Editor, {useMonaco} from "@monaco-editor/react";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {initVimMode} from 'monaco-vim';
import {HeartFilledIcon, MixerHorizontalIcon} from "@radix-ui/react-icons";
import {supportedLanguages} from "@/pages/notes/utils.ts";
import {InputTags} from "@/components/ui/input-tags.tsx";
import {useDeleteNote, useUpdateNote} from "@/components/notes/noteApi.ts";
import useAppStore from "@/store/useAppStore.ts";

interface NoteDisplayProps {
    editingNote: Note | null
}

export function NoteDisplay({editingNote}: NoteDisplayProps) {
    // const {updateNote} = useNoteStore(state => ({
    //     updateNote: state.updateNote,
    // }));
    const [note, setNote] = useState<Note | null>(editingNote);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const monaco = useMonaco();
    const [vimMode, setVimMode] = useState(null);
    const editorRef = useRef(null);

    const [editorFont, setEditorFont] = useState("Fira Code");
    const [editorFontSize, setEditorFontSize] = useState(16);
    const [editorTheme, setEditorTheme] = useState("monokai");
    const [editorVimMode, setEditorVimMode] = useState(false);
    const [labels, setLabels] = useState([]);
    const {mutate: updateNote} = useUpdateNote();
    const {mutate: deleteNote} = useDeleteNote();
    const setEditingNote = useAppStore(state => state.setEditingNote);

    const createStudySession = async (note) => {
        const response = await invoke<string>('create_study_session', {id: note.id});
        let res = JSON.parse(response);
        console.log("Created study session res:", res)
    }

    useEffect(() => {
        setTheme();
    }, [monaco]);

    const setTheme = () => {
        if (monaco) {
            fetch(`/themes/${monacoThemes[editorTheme]}.json`)
                .then(data => data.json())
                .then(data => {
                    monaco.editor.defineTheme(editorTheme, data);
                    monaco.editor.setTheme(editorTheme);
                })
        }
    }

    useEffect(() => {
        setTheme()
    }, [editorTheme]);

    useEffect(() => {
        if (editingNote) {
            setLabels(editingNote.labels.split(','));
            setNote(editingNote);
            setHasUnsavedChanges(false);
        }
    }, [editingNote]);

    const handleEditorDidMount = (editor, monaco) => {
        // setup key bindings
        editor.addAction({
            id: "save-note",
            label: "Save Note",
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
            run: function (editor) {
                alert("we wanna save something => " + editor.getValue());
                handleSaveNote();
                return null;
            }
        });

        editorRef.current = editor;
    };

    const toggleVimMode = () => {
        if (!editorRef?.current) return;
        if (editorVimMode) {
            const statusNode = document.querySelector(".status-node");
            const vimMode = initVimMode(editorRef.current, statusNode);
            setVimMode(vimMode);
        } else {
            if (vimMode) {
                const statusNode = document.querySelector(".status-node");
                statusNode.innerHTML = "";
                vimMode.dispose()
            }
        }
    };

    useEffect(() => {
        toggleVimMode();
    }, [editorVimMode]);

    const handleSaveNote = () => {
        if (note && hasUnsavedChanges) {
            updateNote(note);
            setHasUnsavedChanges(false);
        }
    };

    const debounceUpdateNote = (updatedNote: Note) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        setHasUnsavedChanges(true);

        if (isAutoSaveEnabled) {
            saveTimeoutRef.current = setTimeout(() => {
                updateNote(updatedNote);
                setHasUnsavedChanges(false);
            }, 5000);
        }
    };

    const handleNoteChange = (key: string, value: string | string[] | boolean) => {
        console.log("Updating note:", key, value);
        const updatedNote = {
            ...note,
            date: new Date().toISOString(),
            [key]: value,
        } as Note;
        debounceUpdateNote(updatedNote);
        setNote(updatedNote);
    };

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleNoteChange('title', event.target.value);
    };

    const handleLanguageChange = (newLanguage: string) => {
        handleNoteChange('language', newLanguage);
    };
    const handleContentChange = (text: string) => {
        if (text !== undefined) {
            handleNoteChange('text', text);
        }
    };
    const handleDeleteNote = (id: number) => {
        deleteNote(id);
        setEditingNote(null)
    }

    return (
        <div className="flex h-full flex-col">
            {note ? (
                <div className="flex flex-1 flex-col">
                    <div className="grid gap-4 grid-cols-12 text-sm p-2">
                        <div className="grid col-span-9 gap-1">
                            <Input
                                type="text"
                                value={note.title}
                                onChange={handleTitleChange}
                                placeholder="Note Title"
                                className="font-semibold w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="col-span-3">
                            <Select defaultValue="markdown" value={note.language}
                                    onValueChange={handleLanguageChange}
                            >
                                <SelectTrigger id="area">
                                    <SelectValue placeholder="Select"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {supportedLanguages.map(language => (
                                        <SelectItem key={language.id} value={language.name}>{language.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Separator/>
                    <div className="grid gap-4 grid-cols-12 text-sm p-2">
                        <div className="col-span-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={!note}
                                            onClick={() => handleNoteChange("favorite", !note?.favorite)}
                                    >
                                        {note.favorite ?
                                            <HeartFilledIcon className="mr-2 h-4 w-4 text-red-600"/> :
                                            <Heart className="mr-2 h-4 w-4"/>}
                                        <span className="sr-only">Favorite</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Favorite</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={!note}
                                            onClick={() => handleDeleteNote(note?.id)}
                                    >
                                        <Trash className="mr-2 h-4 w-4 text-red-600"/>
                                        <span className="sr-only">Delete Note</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete Note</TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="col-span-8 flex items-center text-left space-x-4">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="gistSync">Gist Sync</Label>
                            <Switch
                                id="gistSync"
                                checked={note?.gist_sync ?? false}
                                onCheckedChange={(value) => handleNoteChange("gist_sync", value)}
                            />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="autoSave">Auto Save</Label>
                                <Switch
                                    id="autoSave"
                                    checked={isAutoSaveEnabled}
                                    onCheckedChange={setIsAutoSaveEnabled}
                                />
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSaveNote}
                                        disabled={!hasUnsavedChanges}
                                    >
                                        <Save className="h-4 w-4 mr-1" />
                                        Save
                                        {hasUnsavedChanges && <span className="ml-1 text-yellow-500">*</span>}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {hasUnsavedChanges ? "Save changes" : "No unsaved changes"}
                                </TooltipContent>
                            </Tooltip>
                            <Button
                                className="ml-2"
                                variant="outline"
                                size="sm"
                                disabled={!note}
                                        onClick={() => createStudySession(note)}
                                >
                                Study this note
                                </Button>
                            </div>
                        {note.date && (
                            <div className="col-span-3 text-xs text-muted-foreground flex justify-end items-center">
                                <div className="hidden xl:flex">
                                    {format(new Date(note.date), "PPpp")}
                                </div>
                            </div>
                        )}
                    </div>
                    <Separator/>
                    <div className="flex-1 whitespace-pre-wrap p-2 text-sm">
                        <Editor
                            height="97%"
                            language={note.language}
                            value={note.text}
                            onMount={handleEditorDidMount}
                            onChange={handleContentChange}
                            className="note-editor"
                            wrapperProps={{
                                "className": "note-editor-wrapper overflow-hidden rounded-lg",
                            }}

                            options={{
                                "cursorBlinking": "blink",
                                "cursorStyle": "block-outline",
                                "fontSize": `${editorFontSize}px`,
                                "fontFamily": editorFont,
                                "fontLigatures": true,
                            }}
                        />
                        <code className="status-node"></code>
                    </div>
                    {/*<Separator className="mt-auto"/>*/}
                    {/*<div className="p-4">*/}
                    {/*    <InputTags value={labels} onChange={(v) => {*/}
                    {/*        // setLabels(v)*/}
                    {/*    }}/>*/}
                    {/*</div>*/}
                </div>
            ) : (
                <div className="p-8 text-center text-muted-foreground">
                    No message selected
                </div>
            )}
        </div>
    )
}
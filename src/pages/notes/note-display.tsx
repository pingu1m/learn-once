// @ts-nocheck
import format from "date-fns/format"
import {Heart, Trash} from "lucide-react"
import {Note} from "@/data.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
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

    // React Query mutation for updating the note
    // const updateNoteMutation = useMutation(
    //     (updatedNote) => invoke('note_update', { note: updatedNote }),
    //     {
    //         onSuccess: () => {
    //             console.log('Note updated successfully');
    //         },
    //         onError: (error) => {
    //             console.error('Error updating note:', error);
    //         },
    //     }
    // );

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
        }
    }, [editingNote]);

    // useEffect(() => {
    //     return () => {
    //         if (saveTimeoutRef.current) {
    //             clearTimeout(saveTimeoutRef.current);
    //             if (note) {
    //                 // updateNoteMutation.mutate({ ...note, updated_at: new Date().toISOString() });
    //                 updateNote({...note, updated_at: new Date().toISOString()});
    //             }
    //             // @ts-ignore
    //         }
    //     };
    // }, [note]);

    const handleEditorDidMount = (editor, monaco) => {
        // setup key bindings
        editor.addAction({
            id: "some-unique-id",
            label: "Some label!",
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
            run: function (editor) {
                alert("we wanna save something => " + editor.getValue());
                return null;
            }
        });

        editorRef.current = editor; // Store a reference to the editor instance
    };

    const toggleVimMode = () => {
        if (!editorRef?.current) return;
        if (editorVimMode) {
            const statusNode = document.querySelector(".status-node");
            const vimMode = initVimMode(editorRef.current, statusNode);
            console.log("res", vimMode)
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

    // useEffect(() => {
    //     handleNoteChange('labels', labels)
    // }, [labels])

    const debounceUpdateNote = (updatedNote: Note) => {
        updateNote(updatedNote);
        // if (saveTimeoutRef.current) {
        //     clearTimeout(saveTimeoutRef.current);
        // }
        // saveTimeoutRef.current = setTimeout(() => {
        //     updateNote(updatedNote);
        //     // updateNoteMutation.mutate(updatedNote);
        // }, 5000);
    };

    const handleNoteChange = (key: string, value: string | string[] | boolean) => {
        console.log("Updating note:", key, value);
        const updatedNote = {
            ...note,
            date: new Date().toISOString(),
            [key]: value
        } as Note;
        debounceUpdateNote(updatedNote);
        setNote(updatedNote)
    };

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleNoteChange('title', event.target.value);
    };
    //
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
                        <div className="col-span-8">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={!note}
                                            onClick={() => handleNoteChange("favorite", !note?.favorite)}
                                    >
                                        {note.favorite ?
                                            <HeartFilledIcon className="mr-2 h-4 w-4 text-red-600"/> :
                                            <Heart className="mr-2 h-4 w-4"/>}
                                        <span className="sr-only">Forward</span>
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
                        {note.date && (
                            <div className="col-span-3 text-xs text-muted-foreground flex justify-start items-center">
                                <div className="hidden xl:flex">
                                    {format(new Date(note.date), "PPpp")}
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end">
                            <Button className="mr-2" variant="outline" size="sm" disabled={!note}
                                    onClick={() => createStudySession(note)}
                            >
                                Study this note.
                            </Button>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
                                        <MixerHorizontalIcon className="mr-2 h-4 w-4"/>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Editor settings</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Change editor settings below.
                                            </p>
                                        </div>
                                        <div className="grid gap-2">
                                            <div className="grid grid-cols-3 items-center gap-4">
                                                <Label htmlFor="width">Font</Label>
                                                <div className="col-span-2">
                                                    <Select
                                                        className="col-span-2"
                                                        defaultValue={editorFont}
                                                        onValueChange={(v) => setEditorFont(v)}
                                                    >
                                                        <SelectTrigger id="area">
                                                            <SelectValue placeholder="Select"/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Fira Code">Fira Code</SelectItem>
                                                            <SelectItem value="Roboto Mono">Roboto Mono</SelectItem>
                                                            <SelectItem value="Source Code Pro">Source Code
                                                                Pro</SelectItem>
                                                            <SelectItem value="Space Mono">Space Mono</SelectItem>
                                                            <SelectItem value="JetBrains Mono">JetBrains
                                                                Mono</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 items-center gap-4">
                                                <Label htmlFor="maxWidth">Size</Label>
                                                <Input
                                                    id="maxWidth"
                                                    type="number"
                                                    value={editorFontSize}
                                                    onChange={(e) => setEditorFontSize(e.target.value)}
                                                    className="col-span-2 h-8"
                                                />
                                            </div>
                                            <div className="grid grid-cols-3 items-center gap-4">
                                                <Label htmlFor="height">Theme</Label>
                                                <div className="col-span-2">
                                                    <Select
                                                        defaultValue="monokai"
                                                        onValueChange={(value) => setEditorTheme(value)}>
                                                        <SelectTrigger id="area">
                                                            <SelectValue placeholder="Select"/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.entries(monacoThemes).map(([themeId, themeName]) => (
                                                                <SelectItem key={themeId} value={themeId}>
                                                                    {themeName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 items-center gap-4">
                                                <Label htmlFor="vimMode">Vim mode</Label>
                                                <Switch
                                                    checked={editorVimMode}
                                                    onCheckedChange={() => setEditorVimMode(!editorVimMode)}
                                                    id="vimMode"
                                                    aria-label="Toggle Vim mode"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
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
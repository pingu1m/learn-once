// @ts-nocheck
import format from "date-fns/format"
import {Heart} from "lucide-react"
import {Note} from "@/data.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import monacoThemes from 'monaco-themes/themes/themelist';
import {Label} from "@/components/ui/label.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import useNoteStore from "@/store/useNoteStore.ts";
import React, {useEffect, useRef, useState} from "react";
import Editor, {useMonaco} from "@monaco-editor/react";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {initVimMode} from 'monaco-vim';
import {HeartFilledIcon, MixerHorizontalIcon} from "@radix-ui/react-icons";
import {supportedLanguages} from "@/pages/notes/utils.ts";
import {InputTags} from "@/components/ui/input-tags.tsx";

interface NoteDisplayProps {
    editingNote: Note | null
}

export function NoteDisplay({editingNote}: NoteDisplayProps) {
    const {updateNote} = useNoteStore(state => ({
        updateNote: state.updateNote,
    }));
    const [note, setNote] = useState<Note | null>(editingNote);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const monaco = useMonaco();
    // const monacoRef = useRef(null);
    const [vimMode, setVimMode] = useState(null);
    const editorRef = useRef(null);

    const [editorFont, setEditorFont] = useState("Fira Code");
    const [editorFontSize, setEditorFontSize] = useState(16);
    const [editorTheme, setEditorTheme] = useState("monokai");
    const [editorVimMode, setEditorVimMode] = useState(false);
    const [labels, setLabels] = useState([]);

    useEffect(() => {
        setTheme()
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
            setLabels(editingNote.labels);
            setNote(editingNote);
        }
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

    const handleEditorDidMount = (editor, monaco) => {
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

    useEffect(() => {
        handleNoteChange('labels', labels)
    }, [labels])

    const debounceUpdateNote = (updatedNote: Note) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            updateNote(updatedNote);
        }, 5000);
    };

    const handleNoteChange = (key: string, value: string | string[] | boolean) => {
        console.log("Updating note:", key, value);
        const updatedNote = {
            ...note,
            date: new Date().toISOString(),
            [key]: value
        } as Note;
        setNote(updatedNote)
        debounceUpdateNote(updatedNote);
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

    return (
        <div className="flex h-full flex-col">
            {note ? (
                <div className="flex flex-1 flex-col">
                    <div className="grid gap-4 grid-cols-12 text-sm p-4">
                        <div className="grid col-span-5 gap-1">
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
                        <div className="">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={!note}
                                            onClick={() => handleNoteChange("favorite", !note?.favorite)}
                                    >
                                        {!note.favorite ?
                                            <HeartFilledIcon className="mr-2 h-4 w-4 text-red-600"/> :
                                            <Heart className="mr-2 h-4 w-4"/>}
                                        <span className="sr-only">Forward</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Favorite</TooltipContent>
                            </Tooltip>
                        </div>
                        {note.date && (
                            <div className="col-span-2 text-xs text-muted-foreground flex justify-end items-center">
                                {format(new Date(note.date), "PPpp")}
                            </div>
                        )}
                        <div className="flex justify-end">
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
                    <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
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
                    <Separator className="mt-auto"/>
                    <div className="p-4">
                        <InputTags value={labels} onChange={(v) => {
                            setLabels(v)
                        }}/>
                    </div>
                </div>
            ) : (
                <div className="p-8 text-center text-muted-foreground">
                    No message selected
                </div>
            )}
        </div>
    )
}
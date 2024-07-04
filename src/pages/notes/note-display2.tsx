import addDays from "date-fns/addDays"
import addHours from "date-fns/addHours"
import format from "date-fns/format"
import nextSaturday from "date-fns/nextSaturday"
import {
    Archive,
    ArchiveX,
    Clock,
    Forward,
    MoreVertical,
    Reply,
    ReplyAll,
    Trash2,
} from "lucide-react"
import {Note} from "@/data.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {Calendar} from "@/components/ui/calendar.tsx";
import useNoteStore from "@/store/useNoteStore.ts";
import React, {useEffect, useRef, useState} from "react";
import Editor, {useMonaco} from "@monaco-editor/react";
import {Badge} from "@/components/ui/badge.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

interface NoteDisplayProps {
    editingNote: Note | null
}

export function NoteDisplay({editingNote}: NoteDisplayProps) {
    const today = new Date()
    const {updateNote} = useNoteStore(state => ({
        updateNote: state.updateNote,
    }));
    const [note, setNote] = useState<Note | null>(editingNote);
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

    function handleEditorDidMount(editor: typeof Editor, monaco) {
        // setup key bindings before monaco-vim setup
        monacoRef.current = monaco;

        // setup key bindings
        // editor.addAction({
        //     // an unique identifier of the contributed action
        //     id: "some-unique-id",
        //     // a label of the action that will be presented to the user
        //     label: "Some label!",
        //     keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
        //
        //     // the method that will be executed when the action is triggered.
        //     run: function (editor: typeof Editor) {
        //         alert("we wanna save something => " + editor.getValue());
        //         return null;
        //     }
        // });

        // setup monaco-vim
        window.require.config({
            paths: {
                "monaco-vim": "https://unpkg.com/monaco-vim/dist/monaco-vim"
            }
        });

        // @ts-ignore
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
            updateNote({...updatedNote, date: new Date().toISOString()});
        }, 5000);
    };

    const handleNoteChange = (key: string, value: string | string[]) => {
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

    const handleLanguageChange = (newLanguage: string) => {
        handleNoteChange('language', newLanguage);
    };
    const handleContentChange = (text: string) => {
        handleNoteChange('text', text);
    };

    const handleToggleTag = (tag: string) => {
        if (note) {
            const updatedTags = note.labels.includes(tag) ? note.labels.filter(t => t !== tag) : [...note.labels, tag];
            handleNoteChange('labels', updatedTags);
        }
    };


    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center p-2">
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={!note}>
                                <Archive className="h-4 w-4"/>
                                <span className="sr-only">Archive</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Archive</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={!note}>
                                <ArchiveX className="h-4 w-4"/>
                                <span className="sr-only">Move to junk</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Move to junk</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={!note}>
                                <Trash2 className="h-4 w-4"/>
                                <span className="sr-only">Move to trash</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Move to trash</TooltipContent>
                    </Tooltip>
                    <Separator orientation="vertical" className="mx-1 h-6"/>
                    <Tooltip>
                        <Popover>
                            <PopoverTrigger asChild>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={!note}>
                                        <Clock className="h-4 w-4"/>
                                        <span className="sr-only">Snooze</span>
                                    </Button>
                                </TooltipTrigger>
                            </PopoverTrigger>
                            <PopoverContent className="flex w-[535px] p-0">
                                <div className="flex flex-col gap-2 border-r px-2 py-4">
                                    <div className="px-4 text-sm font-medium">Snooze until</div>
                                    <div className="grid min-w-[250px] gap-1">
                                        <Button
                                            variant="ghost"
                                            className="justify-start font-normal"
                                        >
                                            Later today{" "}
                                            <span className="ml-auto text-muted-foreground">
                        {format(addHours(today, 4), "E, h:m b")}
                      </span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="justify-start font-normal"
                                        >
                                            Tomorrow
                                            <span className="ml-auto text-muted-foreground">
                        {format(addDays(today, 1), "E, h:m b")}
                      </span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="justify-start font-normal"
                                        >
                                            This weekend
                                            <span className="ml-auto text-muted-foreground">
                        {format(nextSaturday(today), "E, h:m b")}
                      </span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="justify-start font-normal"
                                        >
                                            Next week
                                            <span className="ml-auto text-muted-foreground">
                        {format(addDays(today, 7), "E, h:m b")}
                      </span>
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <Calendar/>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <TooltipContent>Snooze</TooltipContent>
                    </Tooltip>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={!note}>
                                <Reply className="h-4 w-4"/>
                                <span className="sr-only">Reply</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reply</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={!note}>
                                <ReplyAll className="h-4 w-4"/>
                                <span className="sr-only">Reply all</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reply all</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={!note}>
                                <Forward className="h-4 w-4"/>
                                <span className="sr-only">Forward</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Forward</TooltipContent>
                    </Tooltip>
                </div>
                <Separator orientation="vertical" className="mx-2 h-6"/>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={!note}>
                            <MoreVertical className="h-4 w-4"/>
                            <span className="sr-only">More</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Mark as unread</DropdownMenuItem>
                        <DropdownMenuItem>Star thread</DropdownMenuItem>
                        <DropdownMenuItem>Add label</DropdownMenuItem>
                        <DropdownMenuItem>Mute thread</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Separator/>
            {note ? (
                <div className="flex flex-1 flex-col">
                    <div className="flex items-start p-4">
                        <div className="flex items-start gap-4 text-sm">
                            {/*<Avatar>*/}
                            {/*    <AvatarImage alt={note.name} />*/}
                            {/*    <AvatarFallback>*/}
                            {/*        {note.title*/}
                            {/*            .split(" ")*/}
                            {/*            .map((chunk) => chunk[0])*/}
                            {/*            .join("")}*/}
                            {/*    </AvatarFallback>*/}
                            {/*</Avatar>*/}
                            <div className="grid gap-1">
                                <Input
                                    type="text"
                                    value={note.title}
                                    onChange={handleTitleChange}
                                    placeholder="Note Title"
                                    className="font-semibold w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {/*<div className="line-clamp-1 text-xs">{note.subject}</div>*/}
                                {/*<div className="line-clamp-1 text-xs">*/}
                                {/*    <span className="font-medium">Reply-To:</span> {note.email}*/}
                                {/*</div>*/}
                            </div>
                        </div>
                        {note.date && (
                            <div className="ml-auto text-xs text-muted-foreground">
                                {format(new Date(note.date), "PPpp")}
                            </div>
                        )}
                    </div>
                    <Separator/>
                    <div className="flex items-start p-1">
                        {/*<div className="grid grid-cols-2 gap-4 mb-1">*/}
                        {/*    <div className="grid gap-2">*/}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={!note}>
                                    <Archive className="h-4 w-4"/>
                                    <span className="sr-only">Archive</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Archive</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Switch id="vim" aria-label="Vim mode"/> Vim Mode
                            </TooltipTrigger>
                            <TooltipContent>Move to junk</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Select defaultValue="markdown" value={note.language}
                                        onValueChange={handleLanguageChange}
                                >
                                    <SelectTrigger id="area">
                                        <SelectValue placeholder="Select"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="plaintext">Plaintext</SelectItem>
                                        <SelectItem value="markdown">Markdown</SelectItem>
                                        <SelectItem value="javascript">Js</SelectItem>
                                        <SelectItem value="python">Python</SelectItem>
                                        <SelectItem value="java">Java</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TooltipTrigger>
                            <TooltipContent>Move to trash</TooltipContent>
                        </Tooltip>
                        <Separator orientation="vertical" className="mx-1 h-6"/>
                    </div>
                    <Separator/>
                    <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
                        <Editor
                            height="70vh"
                            language={note.language}
                            value={note.text}
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
                                            className={`hover:bg-gray-100/50 dark:hover:bg-gray-800/50 ${note.labels.includes(tag) ? 'bg-gray-200' : ''}`}
                                            variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <Separator className="mt-auto"/>
                    <div className="p-4">
                        <form>
                            <div className="grid gap-4">
                                <Textarea
                                    className="p-4"
                                    placeholder={`Reply ${note.name}...`}
                                />
                                <div className="flex items-center">
                                    <Label
                                        htmlFor="mute"
                                        className="flex items-center gap-2 text-xs font-normal"
                                    >
                                        <Switch id="mute" aria-label="Mute thread"/> Mute this
                                        thread
                                    </Label>
                                    <Button
                                        onClick={(e) => e.preventDefault()}
                                        size="sm"
                                        className="ml-auto"
                                    >
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </form>
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
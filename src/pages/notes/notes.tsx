import {FilePlus, Search} from "lucide-react"
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {Input} from "@/components/ui/input.tsx";
import {NoteList} from "@/pages/notes/note-list.tsx";
import {NoteDisplay} from "@/pages/notes/note-display.tsx";
import useAppStore from "@/store/useAppStore.ts";
import {useCreateNote, useNotes} from "@/components/notes/noteApi.ts";
import * as React from "react";
import {Button} from "@/components/ui/button.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import format from "date-fns/format"
import {Bottom} from "@/components/layout/bottom.tsx";
import {toast} from "react-toastify";

export function Notes() {
    const defaultLayout = [265, 40, 60]
    const {data: notes, isLoading, isError} = useNotes();
    const [editingNote, setEditingNote] = useAppStore(state => [state.editingNote, state.setEditingNote]);
    const {data: createdNote, mutate: createNote} = useCreateNote()

    const handleCreateNote = () => {
        let date_sync = format(new Date(), "PPpp")
        let note = {
            id: 0,
            // @ts-ignore
            title: "New Note @ " + date_sync,
            text: `
#Sample Markdown Note with Cards

Card definition below

\`\`\`toml
[[card]]
title = "What is Rust?"
hint = "Programming Language"
description = "A systems programming language focused on safety, speed, and concurrency."
example = "Rust is often used for performance-critical services."
[[card]]
title = "What is ownership in Rust?"
hint = "Memory Management"
description = "A set of rules that governs how a Rust program manages memory."
example = "Ownership ensures memory safety without a garbage collector."
\`\`\`

You can declare more card blocks
`,
            date: new Date().toISOString(),
            favorite: false,
            labels: "",
            language: "markdown",
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            gist_key: "lo",
            gist_sync: false,
        }
        // @ts-ignore
        let new_note = createNote(note)
        console.log("New note from backend", createdNote)
        // @ts-ignore
        setEditingNote(createdNote)
    }

    const notify = () => {toast.success('Notification that overrides the position setting!');};

    return (
        <>
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={(sizes: number[]) => {
                    document.cookie = `react-resizable-panels:layout=${JSON.stringify(
                        sizes
                    )}`
                }}
                // className="h-full max-h-screen items-stretch"
                className=""
            >
                <ResizablePanel className="h-screen" defaultSize={defaultLayout[1]} minSize={30}>
                    {isLoading ? (
                        <div>Loading...</div> // You can replace this with a loader component
                    ) : isError ? (
                        <div>Error loading note.</div> // You can replace this with an error component
                    ) : (
                        <div className="h-screen flex flex-col items-stretch justify-between">
                            <Tabs defaultValue="all" className="flex-grow">
                                <div
                                    className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => handleCreateNote()}>
                                                <FilePlus className="mr-2 h-4 w-4"/>
                                                <span className="sr-only">New</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">New Note</TooltipContent>
                                    </Tooltip>
                                    <form className="flex-grow mr-2">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                                            <Input placeholder="Search" className="pl-8"
                                                // onChange={(e) => searchItem(e.target.value)}
                                            />
                                        </div>
                                    </form>
                                    <TabsList className="ml-auto">
                                        <TabsTrigger
                                            value="all"
                                            className="text-zinc-600 dark:text-zinc-200"
                                        >
                                            All
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="unread"
                                            className="text-zinc-600 dark:text-zinc-200"
                                        >
                                            Favorite
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                                <Separator className="mb-2"/>
                                {isLoading ? (
                                    <div>Loading...</div> // You can replace this with a loader component
                                ) : isError ? (
                                    <div>Error loading note.</div> // You can replace this with an error component
                                ) : (
                                    <>
                                        <TabsContent value="all" className="m-0 h-[40%] overflow-hidden">
                                            <Button onClick={() => notify()} > Notify </Button>
                                            {notes && <NoteList items={notes}/>}
                                        </TabsContent>
                                        <TabsContent value="unread" className="m-0">
                                            {JSON.stringify(notes)}
                                        </TabsContent>
                                    </>
                                )}
                            </Tabs>
                            <Bottom />
                        </div>
                    )}
                </ResizablePanel>
                <ResizableHandle withHandle/>
                <ResizablePanel defaultSize={defaultLayout[2]}>
                    {isLoading ? (
                        <div>Loading...</div> // You can replace this with a loader component
                    ) : isError ? (
                        <div>Error loading note.</div> // You can replace this with an error component
                    ) : editingNote ? (
                        <NoteDisplay editingNote={editingNote}/>
                    ) : (
                        <div className="flex h-full flex-row justify-center items-center text-2xl">No note
                            selected</div>
                    )}
                </ResizablePanel>
            </ResizablePanelGroup>
        </>
    )
}
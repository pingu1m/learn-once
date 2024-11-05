import {TooltipProvider} from "@/components/ui/tooltip.tsx";
import * as React from "react";
import {ToastContainer} from "react-toastify";
import {
    Sidebar, SidebarContent, SidebarFooter,
    SidebarGroup, SidebarGroupContent,
    SidebarHeader, SidebarInput,
    SidebarMenu, SidebarMenuButton, SidebarMenuItem,
    SidebarProvider, SidebarRail,
} from "@/components/ui/sidebar.tsx";
import {Tabs, TabsContent, TabsList} from "@/components/ui/tabs.tsx";
import {useCreateNote, useNotes, useSessions} from "@/components/notes/noteApi.ts";
import useAppStore from "@/store/useAppStore.ts";
import format from "date-fns/format";
import {NoteDisplay} from "@/pages/notes/note-display.tsx";
import {BookOpenText, GitBranch, NotebookPen, PlusIcon, Search} from "lucide-react";
import {Label} from "@/components/ui/label.tsx";
import {cn} from "@/lib/utils.ts";
import {SessionDisplay} from "@/pages/sessions/session-display.tsx";
import {SettingsDrawer} from "@/components/layout/app-settings.tsx";

function Main() {
    const {data: notes, isLoading, isError} = useNotes();
    const {data: sessions, isLoading: sessionIsLoading, isError: sessionIsError} = useSessions();
    const [editingNote, setEditingNote] = useAppStore(state => [state.editingNote, state.setEditingNote]);
    const [editingSession, setEditingSession] = useAppStore(state => [state.editingSession, state.setEditingSession]);
    const {data: createdNote, mutate: createNote} = useCreateNote();

    const [searchTerm, setSearchTerm] = React.useState("");
    const [activeTab, setActiveTab] = React.useState("notes");

    // Combine notes and sessions into a single array with type information
    const allItems = React.useMemo(() => {
        const noteItems = (notes || []).map(note => ({
            ...note,
            type: 'note',
            name: note.title,
            gistSynced: note.gist_sync
        }));

        const sessionItems = (sessions || []).map(session => ({
            ...session,
            type: 'session',
            name: session.title,
            gistSynced: false
        }));

        return [...noteItems, ...sessionItems];
    }, [notes, sessions]);

    // Filter combined items based on search term
    const filteredItems = allItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleItemClick = (item) => {
        if (item.type === 'note') {
            setActiveTab("notes");
            setEditingNote(item);
            setEditingSession(null);
        } else {
            setActiveTab("session");
            setEditingSession(item);
            setEditingNote(null);
        }
    };

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
        let new_note = createNote(note)
        setEditingNote(createdNote)
    }

    return (
        <TooltipProvider delayDuration={0}>
            <SidebarProvider>
                <Sidebar>
                    <SidebarHeader>
                        <SidebarGroup className="py-0">
                            <SidebarGroupContent className="relative">
                                <Label htmlFor="search" className="sr-only">
                                    Search
                                </Label>
                                <SidebarInput
                                    id="search"
                                    placeholder="Search notes and sessions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                                <Search
                                    className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50"/>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {filteredItems.map((item, index) => (
                                        <SidebarMenuItem key={index}>
                                            <SidebarMenuButton
                                                className={cn(
                                                    "w-full flex items-center justify-between",
                                                    (item.type === 'note' && editingNote?.id === item.id) && "bg-muted",
                                                    (item.type === 'session' && editingSession?.id === item.id) && "bg-muted"
                                                )}
                                                onClick={() => handleItemClick(item)}
                                            >
                                              <span className="flex items-center">
                                                    {item.type === 'note' ?
                                                        <NotebookPen className="mr-2 h-4 w-4"/>
                                                        :
                                                        <BookOpenText className="mr-2 h-4 w-4"/>
                                                    }
                                                  {item.name.length > 20 ? item.name.slice(0, 22) + '...' : item.name}
                                              </span>
                                                {item.gistSynced && (
                                                    <GitBranch className="h-4 w-4 text-muted-foreground"/>
                                                )}
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarFooter className="mt-auto p-2 border-t bg-gradient-to-b from-transparent to-muted/20">
                        <SidebarMenu className="">
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    variant="outline"
                                    className="w-full justify-start bg-background hover:bg-accent hover:text-accent-foreground shadow-sm transition-all duration-200 border-muted-foreground/20"
                                    onClick={handleCreateNote}
                                >
                                    <PlusIcon className="mr-2 h-4 w-4"/>
                                    New Note
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SettingsDrawer/>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                    <SidebarRail/>
                </Sidebar>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full p-0 m-0">
                    <TabsList className="grid w-full grid-cols-3 hidden">
                    </TabsList>
                    <TabsContent className="mt-0" value="notes">
                        <NoteDisplay editingNote={editingNote}/>
                    </TabsContent>
                    <TabsContent className="mt-0" value="session">
                        <SessionDisplay editingSession={editingSession}/>
                    </TabsContent>
                </Tabs>
            </SidebarProvider>
            <ToastContainer/>
        </TooltipProvider>
    );
}

export default Main;
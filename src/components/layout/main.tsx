import {TooltipProvider} from "@/components/ui/tooltip.tsx";
import * as React from "react";
import {Notes} from "@/pages/notes/notes.tsx";
import {Sessions} from "@/pages/sessions/sessions.tsx";
import {ToastContainer} from "react-toastify";
import {
    Sidebar, SidebarContent, SidebarFooter,
    SidebarGroup, SidebarGroupContent,
    SidebarHeader, SidebarInput,
    SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
    SidebarProvider, SidebarRail,
    SidebarTrigger
} from "@/components/ui/sidebar.tsx";
import {AppSidebar} from "@/components/app-sidebar.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {NavActions} from "@/components/nav-actions.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {useCreateNote, useNotes, useSessions} from "@/components/notes/noteApi.ts";
import useAppStore from "@/store/useAppStore.ts";
import format from "date-fns/format";
import {NoteDisplay} from "@/pages/notes/note-display.tsx";
import {AudioWaveform, BookOpenText, Command, GitBranch, NotebookPen, PlusIcon, Search} from "lucide-react";
import {TeamSwitcher} from "@/components/team-switcher.tsx";
import {Label} from "@/components/ui/label.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {cn} from "@/lib/utils.ts";
import {SessionDisplay} from "@/pages/sessions/session-display.tsx";
import {useState} from "react";

const data = {
    teams: [
        {
            name: "Acme Inc",
            logo: Command,
            plan: "Enterprise",
        },
        {
            name: "Acme Corp.",
            logo: AudioWaveform,
            plan: "Startup",
        },
        {
            name: "Evil Corp.",
            logo: Command,
            plan: "Free",
        },
    ],
    files: [
        { name: "app/page.tsx", gistSynced: true, type: "note" },
        { name: "app/layout.tsx", gistSynced: false, type: "note" },
        { name: "Study Session 1 - JavaScript Basics", gistSynced: false, type: "session" },
        { name: "app/globals.css", gistSynced: false, type: "note" },
        { name: "Study Session 2 - React Fundamentals", gistSynced: false, type: "session" },
        { name: "app/api/hello/route.ts", gistSynced: true, type: "note" },
        { name: "components/ui/button.tsx", gistSynced: false, type: "note" },
        { name: "Study Session 3 - CSS Layouts", gistSynced: true, type: "session" },
        { name: "components/ui/card.tsx", gistSynced: false, type: "note" },
        { name: "Study Session 4 - Node.js Introduction", gistSynced: false, type: "session" },
        { name: "components/header.tsx", gistSynced: true, type: "note" },
        { name: "Study Session 5 - Advanced React Patterns", gistSynced: true, type: "session" },
        { name: "components/footer.tsx", gistSynced: false, type: "note" },
        { name: "lib/utils.ts", gistSynced: true, type: "note" },
        { name: "public/favicon.ico", gistSynced: false, type: "note" },
        { name: "Study Session 6 - TypeScript Essentials", gistSynced: false, type: "session" },
        { name: "public/vercel.svg", gistSynced: false, type: "note" },
        { name: ".eslintrc.json", gistSynced: false, type: "note" },
        { name: "Study Session 7 - API Design Principles", gistSynced: false, type: "session" },
        { name: ".gitignore", gistSynced: false, type: "note" },
        { name: "next.config.js", gistSynced: false, type: "note" },
        { name: "Study Session 8 - Testing with Jest", gistSynced: true, type: "session" },
        { name: "tailwind.config.js", gistSynced: false, type: "note" },
        { name: "package.json", gistSynced: false, type: "note" },
        { name: "Study Session 9 - Functional Programming", gistSynced: false, type: "session" },
        { name: "README.md", gistSynced: true, type: "note" },
        { name: "Study Session 10 - Database Design Basics", gistSynced: false, type: "session" },
    ],

}

function Main() {
    const {data: notes, isLoading, isError} = useNotes();
    const { data: sessions, isLoading: sessionIsLoading, isError: sessionIsError } = useSessions();
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

//     className={cn(
//         "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
//         editingNote && editingNote.id === item.id && "bg-muted"
// )}

    return (
        <TooltipProvider delayDuration={0}>
            <SidebarProvider>
                <Sidebar>
                    <SidebarHeader>
                        {/*<TeamSwitcher teams={data.teams}/>*/}
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
                                            {/*<SidebarMenuBadge>M</SidebarMenuBadge>*/}
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarFooter className="mt-auto p-2 border-t bg-gradient-to-b from-transparent to-muted/20">
                        <SidebarMenu className="space-y-2">
                            <SidebarMenuItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuButton
                                            variant="outline"
                                            className="w-full justify-start bg-background hover:bg-accent hover:text-accent-foreground shadow-sm transition-all duration-200 border-muted-foreground/20"
                                        >
                                            <PlusIcon className="mr-2 h-4 w-4"/>
                                            New Item
                                        </SidebarMenuButton>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="right" align="start" className="w-48">
                                        <DropdownMenuItem onClick={handleCreateNote}>
                                            <PlusIcon className="mr-2 h-4 w-4"/>
                                            Note
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <PlusIcon className="mr-2 h-4 w-4"/>
                                            Study Session
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                    <SidebarRail/>
                </Sidebar>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full p-0 m-0">
                    <TabsList className="grid w-full grid-cols-3 hidden">
                    {/*    <TabsTrigger value="notes">Notes</TabsTrigger>*/}
                    {/*    <TabsTrigger value="session">Session</TabsTrigger>*/}
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

function FileEditor() {
    const [title, setTitle] = React.useState("Untitled")
    const [language, setLanguage] = React.useState("javascript")
    const [content, setContent] = React.useState("")

    return (
        <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b">
                <div className="flex flex-1 items-center gap-2 px-3">
                    <SidebarTrigger/>
                    <Separator orientation="vertical" className="mr-2 h-4"/>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full sm:w-auto flex-grow"
                        placeholder="File title"
                    />
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select language"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="typescript">TypeScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="ml-auto px-3">
                    <NavActions/>
                </div>
            </header>
            <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-col h-full">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-grow min-h-[300px]"
                        placeholder="Enter your code here..."
                    />
                </div>
            </div>
        </SidebarInset>
    )
}

import * as React from "react"
import {
    Sidebar,
    SidebarContent, SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader, SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import {TeamSwitcher} from "@/components/team-switcher.tsx";

import {
    AudioWaveform, BookOpenText,
    Command,
    GitBranch, NotebookPen,
    PlusIcon,
    Search,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Label} from "@/components/ui/label.tsx";

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

// variant="floating"
export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const [searchTerm, setSearchTerm] = React.useState("")
    const filteredFiles = data.files.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={data.teams}/>
                <SidebarGroup className="py-0">
                    <SidebarGroupContent className="relative">
                        <Label htmlFor="search" className="sr-only">
                            Search
                        </Label>
                        <SidebarInput
                            id="search"
                            placeholder="Search the docs..."
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
                            {filteredFiles.map((file, index) => (
                                <SidebarMenuItem key={index}>
                                    <SidebarMenuButton className="w-full flex items-center justify-between">
                      <span className="flex items-center">
                          {file.type == 'note'?
                              <NotebookPen className="mr-2 h-4 w-4"/>
                              :
                              <BookOpenText className="mr-2 h-4 w-4"/>
                          }
                          {file.name.length > 20? file.name.slice(0,22) + '...' : file.name }
                      </span>
                                        {file.gistSynced && (
                                            <GitBranch className="h-4 w-4 text-muted-foreground"
                                                       aria-label="Gist synced"/>
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
                                <DropdownMenuItem>
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
    )
}
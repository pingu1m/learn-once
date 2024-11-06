import format from "date-fns/format";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {GitBranch, Heart, Save, SlidersHorizontal, Trash} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu, SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar.tsx";
import {cn} from "@/lib/utils.ts";
import React from "react";
import {Note} from "@/types/Note.ts";


interface NoteSettingsProps {
    note: Note;
    isAutoSaveEnabled: boolean;
    setIsAutoSaveEnabled: (value: boolean) => void;
    onDeleteNote: () => void;
    onToggleFavorite: () => void;
    onToggleGistSync: () => void;
}


export const NoteSettings: React.FC<NoteSettingsProps> = ({
                                                            note,
                                                            isAutoSaveEnabled,
                                                            setIsAutoSaveEnabled,
                                                            onDeleteNote,
                                                            onToggleFavorite,
                                                            onToggleGistSync,
                                                        }) => {
    return (
        <>
            {note.date && (
                <div className="hidden font-medium text-muted-foreground md:inline-block">
                    Edit {format(new Date(note.date), "PP")}
                </div>
            )}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 data-[state=open]:bg-accent"
                    >
                        <SlidersHorizontal/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-56 overflow-hidden rounded-lg p-0"
                    align="end"
                >
                    <Sidebar collapsible="none" className="bg-transparent">
                        <SidebarContent>
                            <SidebarGroup className="border-b last:border-none">
                                <SidebarGroupContent className="gap-0">
                                    <SidebarMenu>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                className={cn(
                                                    "",
                                                    note.favorite
                                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                        : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                                )}
                                                onClick={() => handleNoteChange("favorite", !note?.favorite)}
                                            >
                                                <Heart className="h-4 w-4"/>
                                                <span>Favorite</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                className={cn(
                                                    "",
                                                    isAutoSaveEnabled
                                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                        : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                                )}
                                                onClick={() => setIsAutoSaveEnabled(!isAutoSaveEnabled)}
                                            >
                                                <Save className="h-4 w-4"/>
                                                <span>Auto Save</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                className={cn(
                                                    "w-full justify-start",
                                                    note.gist_sync
                                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                        : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                                )}
                                                onClick={() => handleNoteChange("gist_sync", !note?.gist_sync)}
                                            >
                                                <GitBranch className="h-4 w-4"/>
                                                <span>Gist Sync</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                className={cn(
                                                    "w-full justify-start",
                                                )}
                                                onClick={() => handleDeleteNote(note?.id)}
                                            >
                                                <Trash className="h-4 w-4 text-red-600"/>
                                                <span>Delete Note</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarContent>
                    </Sidebar>
                </PopoverContent>
            </Popover>

        </>
        )
}
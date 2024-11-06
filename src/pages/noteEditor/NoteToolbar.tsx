import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { BookOpenCheck, Save } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supportedLanguages } from '@/pages/utils';
import {SaveButton} from "@/pages/noteEditor/SaveButton.tsx";
import {Note} from "@/types/Note.ts";

interface NoteToolbarProps {
    note: Note;
    hasUnsavedChanges: boolean;
    onSave: () => void;
    onTitleChange: (value: string) => void;
    onLanguageChange: (value: string) => void;
    onCreateStudySession: () => void;
    isAutoSaveEnabled: boolean;
    setIsAutoSaveEnabled: (value: boolean) => void;
    onDeleteNote: () => void;
    onToggleFavorite: () => void;
    onToggleGistSync: () => void;
}


export const NoteToolbar: React.FC<NoteToolbarProps> = ({
                                                            note,
                                                            hasUnsavedChanges,
                                                            onSave,
                                                            onTitleChange,
                                                            onLanguageChange,
                                                            onCreateStudySession,
                                                            isAutoSaveEnabled,
                                                            setIsAutoSaveEnabled,
                                                            onDeleteNote,
                                                            onToggleFavorite,
                                                            onToggleGistSync,
                                                        }) => {
    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b">
            <div className="flex flex-1 items-center gap-2 px-3">
                <Separator orientation="vertical" className="mr-2 h-4"/>
                <Input
                    value={note.title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="w-full sm:w-auto flex-grow"
                    placeholder="File title"
                    aria-label="Note title"
                />
                <Select value={note.language} onValueChange={onLanguageChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select language"/>
                    </SelectTrigger>
                    <SelectContent>
                        {supportedLanguages.map(language => (
                            <SelectItem key={language.id} value={language.name}>
                                {language.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="ml-auto px-3 flex items-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onCreateStudySession}
                                aria-label="Create study session"
                            >
                                <BookOpenCheck className="h-4 w-4"/>
                                Study
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Create study session</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <SaveButton
                    onSave={onSave}
                    hasUnsavedChanges={hasUnsavedChanges}
                />

                <NoteSettings
                    note={note}
                    isAutoSaveEnabled={isAutoSaveEnabled}
                    setIsAutoSaveEnabled={setIsAutoSaveEnabled}
                    onDeleteNote={onDeleteNote}
                    onToggleFavorite={onToggleFavorite}
                    onToggleGistSync={onToggleGistSync}
                />
            </div>
        </header>
    );
};

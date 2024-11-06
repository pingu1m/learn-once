import { format } from "date-fns/format";
import {
  BookOpenCheck,
  GitBranch,
  Heart,
  Save,
  SlidersHorizontal,
  Trash,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import monacoThemes from "monaco-themes/themes/themelist";
import { invoke } from "@tauri-apps/api/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { Input } from "@/components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { initVimMode } from "monaco-vim";
import { supportedLanguages } from "@/pages/utils.ts";
import { useDeleteNote, useUpdateNote } from "@/components/notes/noteApi.ts";
import useAppStore from "@/store/useAppStore.ts";
import debounce from "lodash/debounce";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { cn } from "@/lib/utils.ts";
import { EditorSettings } from "@/types.ts";
import { toast } from "react-toastify";
import { ModeToggle } from "@/components/mode-toggle";
import { Note } from "@/types/Note";

interface UseSaveNoteProps {
  note: Note | null;
  updateNote: (note: Note) => Promise<void>;
  autoSaveDelay?: number;
}

export function useSaveNote({
  updateNote,
  autoSaveDelay = 5000,
}: UseSaveNoteProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedVersionRef = useRef<string>("");

  const saveNote = useCallback(
    async (noteToSave: Note) => {
      if (!noteToSave) return;

      try {
        setIsSaving(true);
        await updateNote(noteToSave);
        lastSavedVersionRef.current = JSON.stringify(noteToSave);
        setHasUnsavedChanges(false);
        toast.success("Note saved successfully");
      } catch (error) {
        console.error("Failed to save note:", error);
        toast.error("Failed to save note. Please try again.");
      } finally {
        setIsSaving(false);
      }
    },
    [updateNote],
  );

  const debouncedSave = useCallback(
    debounce(async (noteToSave: Note) => {
      if (isAutoSaveEnabled) {
        await saveNote(noteToSave);
      }
    }, autoSaveDelay),
    [isAutoSaveEnabled, saveNote, autoSaveDelay],
  );

  const handleNoteChange = useCallback(
    (
      key: keyof Note,
      value: string | boolean | string[],
      noteToUpdate: Note,
    ) => {
      if (!noteToUpdate) return;

      const updatedNote = {
        ...noteToUpdate,
        date: new Date().toISOString(),
        [key]: value,
      };

      // Check if the note has actually changed
      const currentVersion = JSON.stringify(updatedNote);
      const hasChanged = currentVersion !== lastSavedVersionRef.current;

      if (hasChanged) {
        setHasUnsavedChanges(true);
        if (isAutoSaveEnabled) {
          // Clear any pending auto-save
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          // Trigger new auto-save
          debouncedSave(updatedNote);
        }
      }

      return updatedNote;
    },
    [debouncedSave, isAutoSaveEnabled],
  );

  // Cleanup function
  const cleanup = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    debouncedSave.cancel();
  }, [debouncedSave]);

  return {
    hasUnsavedChanges,
    isAutoSaveEnabled,
    isSaving,
    setIsAutoSaveEnabled,
    handleNoteChange,
    saveNote,
    cleanup,
  };
}

interface NoteDisplayProps {
  editingNote: Note | null;
  settings: EditorSettings;
}

export function NoteDisplay({ editingNote, settings }: NoteDisplayProps) {
  const [note, setNote] = useState<Note | null>(editingNote);
  // const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false);
  const monaco = useMonaco();
  const [vimMode, setVimMode] = useState(null);
  const editorRef = useRef(null);
  const [editorVimMode, setEditorVimMode] = useState(false);

  const { mutate: updateNote } = useUpdateNote();
  const { mutate: deleteNote } = useDeleteNote();
  const setEditingNote = useAppStore((state) => state.setEditingNote);

  const [title, setTitle] = useState(editingNote?.title || "");

  const handleTitleChange = (newTitle: string) => {
    if (note) {
      const updatedNote = handleNoteChange("title", newTitle, note);
      if (updatedNote) {
        setNote(updatedNote);
        setTitle(newTitle);
      }
    }
  };

  const createStudySession = async (note: Note) => {
    const response = await invoke<string>("create_study_session", {
      id: note.id,
    });
    let res = JSON.parse(response);
    console.log("Created study session res:", res);
    toast.success("Study Session created.");
  };

  const setTheme = () => {
    if (monaco) {
      fetch(`/themes/${monacoThemes[settings.editor_theme]}.json`)
        .then((data) => data.json())
        .then((data) => {
          monaco.editor.defineTheme(settings.editor_theme, data);
          monaco.editor.setTheme(settings.editor_theme);
        });
    }
  };
  const toggleVimMode = () => {
    if (!editorRef?.current) return;
    const statusNode = document.querySelector(".status-node");
    if (editorVimMode) {
      const vimMode = initVimMode(editorRef.current, statusNode);
      setVimMode(vimMode);
    } else {
      if (vimMode && statusNode) {
        statusNode.innerHTML = "";
        vimMode.dispose();
      }
    }
  };

  // const handleEditorDidMount = (editor, monaco) => {
  //     // setup key bindings
  //     editor.addAction({
  //         id: "save-note",
  //         label: "Save Note",
  //         keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
  //         run: function (editor) {
  //             alert("we wanna save something => " + editor.getValue());
  //             handleSaveNote();
  //             return null;
  //         }
  //     });
  //
  //     editorRef.current = editor;
  // };

  // const handleSaveNote = () => {
  //     if (note && hasUnsavedChanges) {
  //         updateNote(note);
  //         setHasUnsavedChanges(false);
  //     }
  // };

  // const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //     handleNoteChange('title', event.target.value);
  // };

  // const debounceUpdateNote = (updatedNote: Note) => {
  //     if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
  //     setHasUnsavedChanges(true);
  //
  //     if (isAutoSaveEnabled) {
  //         saveTimeoutRef.current = setTimeout(() => {
  //             updateNote(updatedNote);
  //             toast.success("Note updated");
  //             setHasUnsavedChanges(false);
  //         }, 5000);
  //     }
  // };

  // const handleNoteChange = (key: string, value: string | string[] | boolean) => {
  //     console.log("Updating note:", key, value);
  //     const updatedNote = {
  //         ...note,
  //         date: new Date().toISOString(),
  //         [key]: value,
  //     } as Note;
  //     debounceUpdateNote(updatedNote);
  //     setNote(updatedNote);
  // };

  const handleLanguageChange = (language: string) => {
    if (note) {
      const updatedNote = handleNoteChange("language", language, note);
      if (updatedNote) {
        setNote(updatedNote);
      }
    }
    // handleNoteChange('language', newLanguage);
  };
  // const handleContentChange = (text: string) => {
  //     if (text !== undefined) {
  //         handleNoteChange('text', text);
  //     }
  // };
  const handleDeleteNote = (id: number) => {
    deleteNote(id);
    setEditingNote(null);
  };

  useEffect(() => {
    setTheme();
  }, [monaco, settings]);

  // useEffect(() => {
  //     if (editingNote) {
  //         setNote(editingNote);
  //         setHasUnsavedChanges(false);
  //     }
  //     console.log("SSSS")
  //     console.log(settings);
  // }, [editingNote]);

  useEffect(() => {
    toggleVimMode();
  }, [editorVimMode]);

  // Use our new custom hook for save functionality
  const {
    hasUnsavedChanges,
    isAutoSaveEnabled,
    isSaving,
    setIsAutoSaveEnabled,
    handleNoteChange,
    saveNote,
    cleanup,
  } = useSaveNote({
    note,
    updateNote: async (noteToSave) => {
      return new Promise((resolve, reject) => {
        try {
          updateNote(noteToSave);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },
  });

  // Handle content changes
  const handleContentChange = useCallback(
    (text: string) => {
      if (text !== undefined && note) {
        const updatedNote = handleNoteChange("text", text, note);
        if (updatedNote) {
          setNote(updatedNote);
        }
      }
    },
    [note, handleNoteChange],
  );

  // Handle title changes

  // Save keyboard shortcut handler
  const handleKeyboardSave = useCallback(
    (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      if ((isMac ? event.metaKey : event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        if (note && hasUnsavedChanges) {
          saveNote(note);
        }
      }
    },
    [note, hasUnsavedChanges, saveNote],
  );

  // Setup keyboard shortcuts
  useEffect(() => {
    document.addEventListener("keydown", handleKeyboardSave);
    return () => {
      document.removeEventListener("keydown", handleKeyboardSave);
      cleanup(); // Clean up auto-save timeouts
    };
  }, [handleKeyboardSave, cleanup]);

  // Update note when editingNote changes
  useEffect(() => {
    if (editingNote) {
      setNote(editingNote);
    }
  }, [editingNote]);

  // Prompt user before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Save button component
  const SaveButton = () => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => note && saveNote(note)}
      disabled={!hasUnsavedChanges || isSaving}
      className="relative group"
    >
      <Save className={cn("h-4 w-4 mr-1", isSaving && "animate-spin")} />
      {isSaving ? "Saving..." : "Save"}
      {hasUnsavedChanges && <span className="ml-1 text-yellow-500">*</span>}
      <span className="ml-2 text-xs text-muted-foreground">
        {navigator.platform.toUpperCase().indexOf("MAC") >= 0
          ? "⌘ S"
          : "Ctrl + S"}
      </span>
    </Button>
  );

  let topNavActions = note ? (
    <div className="flex items-center gap-2 text-sm">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="default"
              disabled={!note}
              onClick={() => createStudySession(note)}
            >
              <BookOpenCheck className="h-4 w-4" />
              Study
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Study this Note</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SaveButton />
            {/*<div className="flex items-center gap-2">*/}
            {/*    <Button*/}
            {/*        variant="outline"*/}
            {/*        size="sm"*/}
            {/*        onClick={handleNoteChange}*/}
            {/*        disabled={!hasUnsavedChanges}*/}
            {/*        className="relative group"*/}
            {/*    >*/}
            {/*        <Save className="h-4 w-4 mr-1"/>*/}
            {/*        Save*/}
            {/*        {hasUnsavedChanges && <span className="ml-1 text-yellow-500">*</span>}*/}
            {/*    </Button>*/}
            {/*</div>*/}
          </TooltipTrigger>
          <TooltipContent>
            {hasUnsavedChanges ? "Save changes" : "No unsaved changes"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
            <SlidersHorizontal />
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
                            : "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                        )}
                        onClick={() => {
                          if (note) {
                            const updatedNote = handleNoteChange(
                              "favorite",
                              !note.favorite,
                              note,
                            );
                            if (updatedNote) {
                              setNote(updatedNote);
                            }
                          }
                        }}
                      >
                        <Heart className="h-4 w-4" />
                        <span>Favorite</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={cn(
                          "",
                          isAutoSaveEnabled
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                        )}
                        onClick={() => setIsAutoSaveEnabled(!isAutoSaveEnabled)}
                      >
                        <Save className="h-4 w-4" />
                        <span>Auto Save</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={cn(
                          "w-full justify-start",
                          note.gist_sync
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                        )}
                        onClick={() => {
                          if (note) {
                            const updatedNote = handleNoteChange(
                              "gist_sync",
                              !note.gist_sync,
                              note,
                            );
                            if (updatedNote) {
                              setNote(updatedNote);
                            }
                          }
                        }}
                      >
                        <GitBranch className="h-4 w-4" />
                        <span>Gist Sync</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={cn("w-full justify-start")}
                        onClick={() => handleDeleteNote(note?.id)}
                      >
                        <Trash className="h-4 w-4 text-red-600" />
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
    </div>
  ) : (
    ""
  );

  // @ts-ignore
  let content = note ? (
    <SidebarInset>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <ModeToggle />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Input
            value={note.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full sm:w-auto flex-grow"
            placeholder="File title"
          />
          <Select
            defaultValue="markdown"
            value={note.language}
            onValueChange={(value) => handleLanguageChange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((language) => (
                <SelectItem key={language.id} value={language.name}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto px-3">{topNavActions}</div>
      </header>
      <div className="flex flex-1 flex-col p-4 ">
        <div className="flex flex-row flex-1">
          <Editor
            height="unset"
            language={note.language}
            value={note.text}
            // onMount={handleEditorDidMount}
            onChange={(value: string | undefined) => {
              if (value !== undefined) {
                handleContentChange(value);
              }
            }}
            wrapperProps={{
              className:
                "flex-1 note-editor-wrapper overflow-hidden rounded-sm",
            }}
            options={{
              cursorBlinking: "blink",
              cursorStyle: "block-outline",
              fontSize: settings.editor_font_size,
              fontFamily: settings.editor_font,
              fontLigatures: true,
            }}
          />
          <code className="status-node"></code>
        </div>
      </div>
    </SidebarInset>
  ) : (
    <div className="p-8 text-center text-muted-foreground">
      No message selected
    </div>
  );
  return content;
}

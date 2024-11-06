import * as React from "react";
import "@mdxeditor/editor/style.css";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command.tsx";
import {
  BookOpenText,
  Calculator,
  CreditCard,
  FoldersIcon,
  GitBranch,
  GroupIcon,
  NotebookPen,
  PlusIcon,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge.tsx";
import useSettingsStore from "@/store/useSettingsStore.ts";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar.tsx";
import { Label } from "@/components/ui/label.tsx";
import { cn } from "@/lib/utils.ts";
import { SettingsDrawer } from "@/components/settings-drawer.tsx";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs.tsx";
import { NoteDisplay } from "@/pages/note-display.tsx";
// import {NoteDisplay} from "@/pages/noteEditor/NoteDisplay.tsx";
import { SessionDisplay } from "@/pages/session-display.tsx";
import { ToastContainer } from "react-toastify";
import { useItemsManager } from "@/hooks/useItemsManager.ts";
import { ModeToggle } from "./components/mode-toggle";

function App() {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [lastShiftPress, setLastShiftPress] = useState(0);
  const [pages, setPages] = React.useState<string[]>(["home"]);
  const activePage = pages[pages.length - 1];
  const isHome = activePage === "home";
  const doubleShiftInterval = 300; // Set the interval as needed
  const [bounceClass, setBounceClass] = useState("");
  const { settings, loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const popPage = React.useCallback(() => {
    setPages((pages) => {
      const x = [...pages];
      x.splice(-1, 1);
      return x;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: { key: string }) => {
      if (event.key === "Shift") {
        const currentTime = Date.now();
        if (currentTime - lastShiftPress <= doubleShiftInterval) {
          console.log("Double Shift detected!");
          setOpen(!open);
        }
        setLastShiftPress(currentTime);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lastShiftPress, doubleShiftInterval]);

  function bounce() {
    setBounceClass("bounce");
    console.log(bounceClass);
    setTimeout(() => setBounceClass(""), 200); // Reset the class after the animation
    setInputValue("");
  }

  function onKeyDown(e: KeyboardEvent) {
    console.log("command key down", e.key);
    e.preventDefault();
    if (e.key === "Enter") {
      bounce();
      console.log("bounce");
    }

    if (isHome || inputValue.length) {
      return;
    }

    if (e.key === "Backspace") {
      popPage();
      bounce();
    }
  }

  const commandSetPage = (page: string) => {
    setPages([...pages, page]);
  };

  const {
    filteredItems,
    editingNote,
    editingSession,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    handleItemClick,
    handleCreateNote,
  } = useItemsManager();

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <SidebarGroup className="py-0">
                <SidebarGroupContent className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
                  <Label htmlFor="search" className="sr-only">
                    Search
                  </Label>
                  <SidebarInput
                    id="search"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
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
                            item.type === "note" &&
                              editingNote?.id === item.id &&
                              "bg-muted",
                            item.type === "session" &&
                              editingSession?.id === item.id &&
                              "bg-muted",
                          )}
                          onClick={() => handleItemClick(item)}
                        >
                          <span className="flex items-center">
                            {item.type === "note" ? (
                              <NotebookPen className="mr-2 h-4 w-4" />
                            ) : (
                              <BookOpenText className="mr-2 h-4 w-4" />
                            )}
                            {item.name.length > 20
                              ? item.name.slice(0, 22) + "..."
                              : item.name}
                          </span>
                          {item.gistSynced && (
                            <GitBranch className="h-4 w-4 text-muted-foreground" />
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
                    <PlusIcon className="mr-2 h-4 w-4" />
                    New Note
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SettingsDrawer />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full p-0 m-0"
          >
            <TabsList className="grid w-full grid-cols-3 hidden"></TabsList>
            <TabsContent className="mt-0" value="notes">
              {/*<NoteDisplay editingNote={editingNote}/>*/}
              <NoteDisplay editingNote={editingNote} settings={settings} />
            </TabsContent>
            <TabsContent className="mt-0" value="session">
              <SessionDisplay editingSession={editingSession} />
            </TabsContent>
          </Tabs>
        </SidebarProvider>
        <ToastContainer />
      </TooltipProvider>
      <CommandDialog
        className={bounceClass}
        open={open}
        onOpenChange={setOpen}
        onKeyDown={onKeyDown}
      >
        <div className="m-2">
          {pages.map((p) => (
            <Badge key={p} variant="outline" className="mr-2">
              {p}
            </Badge>
          ))}
        </div>
        <CommandInput
          autoFocus
          placeholder="What do you need?"
          onValueChange={(value) => {
            setInputValue(value);
          }}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {activePage === "home" && <Home setPage={commandSetPage} />}
          {activePage === "notes" && <Notes />}
          {activePage === "themes" && <Themes />}
        </CommandList>
      </CommandDialog>
    </>
  );
}

export default App;

function Home({ setPage }: { setPage: Function }) {
  return (
    <>
      <CommandGroup heading="Actions">
        <CommandItem>
          <Calculator className="mr-2 h-4 w-4" />
          <span>Run last study session</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            setPage("notes");
          }}
        >
          <FoldersIcon className="mr-2 h-4 w-4" />
          Search Projects...
          <CommandShortcut>S P</CommandShortcut>
        </CommandItem>
      </CommandGroup>
      <CommandGroup heading="Notes">
        <CommandItem key="⇧ P">
          <GroupIcon className="mr-2 h-4 w-4" />
          Open Note...
        </CommandItem>
        <CommandItem>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create New Note...
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Study Session">
        <CommandItem key="⇧ P">
          <GroupIcon className="mr-2 h-4 w-4" />
          Open Study Session...
        </CommandItem>
        <CommandItem>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create New Study Session...
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Settings">
        <CommandItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
          <CommandShortcut>⌘P</CommandShortcut>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            setPage("themes");
          }}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Set Themes</span>
          <CommandShortcut>⌘B</CommandShortcut>
        </CommandItem>
        <CommandItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
          <CommandShortcut>⌘S</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </>
  );
}

function Themes() {
  return (
    <>
      <CommandGroup heading="Themes">
        <CommandItem>
          <Calculator className="mr-2 h-4 w-4" />
          <span>Theme: light mode</span>
        </CommandItem>
        <CommandItem>
          <Calculator className="mr-2 h-4 w-4" />
          <span>Theme: dark mode</span>
        </CommandItem>
      </CommandGroup>
    </>
  );
}

function Notes() {
  return (
    <>
      <CommandGroup heading="Notes">
        <CommandItem>Project 1</CommandItem>
        <CommandItem>Project 2</CommandItem>
        <CommandItem>Project 3</CommandItem>
        <CommandItem>Project 4</CommandItem>
        <CommandItem>Project 5</CommandItem>
        <CommandItem>Project 6</CommandItem>
      </CommandGroup>
    </>
  );
}

import * as React from "react";
import "./index.css"
import Main from "@/components/layout/main.tsx";
import 'react-toastify/dist/ReactToastify.css';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList, CommandSeparator, CommandShortcut
} from "@/components/ui/command.tsx";
import {
    Calculator,
    CreditCard,
    FoldersIcon,
    GroupIcon,
    PlusIcon,
    Settings,
    User
} from "lucide-react";
import {useEffect, useState} from "react";
import {Badge} from "@/components/ui/badge.tsx";
import useSettingsStore from "@/store/useSettingsStore.ts";
import Page01 from "@/app/dashboard/page01.tsx";
import Page11 from "@/components/sidebar-11.tsx";
import Page111 from "@/components/sidebar-111.tsx";
import Page13 from "@/components/sidebar-13.tsx";


function App() {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState('')
    const [lastShiftPress, setLastShiftPress] = useState(0);
    const [pages, setPages] = React.useState<string[]>(['home'])
    const activePage = pages[pages.length - 1]
    const isHome = activePage === 'home'
    const doubleShiftInterval = 300; // Set the interval as needed
    const [bounceClass, setBounceClass] = useState('');
    const { loadSettings } = useSettingsStore();

    useEffect(() => {
        loadSettings(); // Load settings from store when component mounts
    }, [loadSettings]);

    const popPage = React.useCallback(() => {
        setPages((pages) => {
            const x = [...pages]
            x.splice(-1, 1)
            return x
        })
    }, [])

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Shift') {
                const currentTime = Date.now();
                if (currentTime - lastShiftPress <= doubleShiftInterval) {
                    console.log('Double Shift detected!');
                    setOpen(!open);
                }
                setLastShiftPress(currentTime);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [lastShiftPress, doubleShiftInterval]);

    function bounce() {
        setBounceClass('bounce');
        console.log(bounceClass)
        setTimeout(() => setBounceClass(''), 200); // Reset the class after the animation
        setInputValue('');
    }

    function onKeyDown(e: KeyboardEvent) {
        console.log("command key down", e.key)
        e.preventDefault()
        if (e.key === 'Enter') {
            bounce()
            console.log("bounce")
        }

        if (isHome || inputValue.length) {
            return
        }

        if (e.key === 'Backspace') {
            popPage()
            bounce()
        }
    }

    const commandSetPage = (page) => {
        setPages([...pages, page])
    }

    return (
        <>
            {/*<Main/>*/}
            {/*<Page13 />*/}
            <Page01 />
            <CommandDialog className={bounceClass} open={open} onOpenChange={setOpen} onKeyDown={onKeyDown}>
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
                        setInputValue(value)
                    }}
                />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {activePage === 'home' && <Home setPage={commandSetPage}/>}
                    {activePage === 'notes' && <Notes/>}
                    {activePage === 'themes' && <Themes/>}
                </CommandList>
            </CommandDialog>
        </>
    );
}

export default App;


function Home({setPage}: { setPage: Function }) {
    return (
        <>
            <CommandGroup heading="Actions">
                <CommandItem>
                    <Calculator className="mr-2 h-4 w-4"/>
                    <span>Run last study session</span>
                </CommandItem>
                <CommandItem onSelect={() => {
                    setPage("notes")
                }}>
                    <FoldersIcon className="mr-2 h-4 w-4"/>
                    Search Projects...
                    <CommandShortcut>S P</CommandShortcut>
                </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Notes">
                <CommandItem key="⇧ P">
                    <GroupIcon className="mr-2 h-4 w-4"/>
                    Open Note...
                </CommandItem>
                <CommandItem>
                    <PlusIcon className="mr-2 h-4 w-4"/>
                    Create New Note...
                </CommandItem>
            </CommandGroup>
            <CommandSeparator/>
            <CommandGroup heading="Study Session">
                <CommandItem key="⇧ P">
                    <GroupIcon className="mr-2 h-4 w-4"/>
                    Open Study Session...
                </CommandItem>
                <CommandItem>
                    <PlusIcon className="mr-2 h-4 w-4"/>
                    Create New Study Session...
                </CommandItem>
            </CommandGroup>
            <CommandSeparator/>
            <CommandGroup heading="Settings">
                <CommandItem>
                    <User className="mr-2 h-4 w-4"/>
                    <span>Profile</span>
                    <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => {
                    setPage("themes")
                }}>
                    <CreditCard className="mr-2 h-4 w-4"/>
                    <span>Set Themes</span>
                    <CommandShortcut>⌘B</CommandShortcut>
                </CommandItem>
                <CommandItem>
                    <Settings className="mr-2 h-4 w-4"/>
                    <span>Settings</span>
                    <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>

            </CommandGroup>
        </>
    )
}

function Themes() {
    return (
        <>
            <CommandGroup heading="Themes">
                <CommandItem>
                    <Calculator className="mr-2 h-4 w-4"/>
                    <span>Theme: light mode</span>
                </CommandItem>
                <CommandItem>
                    <Calculator className="mr-2 h-4 w-4"/>
                    <span>Theme: dark mode</span>
                </CommandItem>
            </CommandGroup>
        </>
    )
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
    )
}

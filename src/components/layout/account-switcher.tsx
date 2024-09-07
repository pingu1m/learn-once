import * as React from "react"

import {cn} from "@/lib/utils"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import {BookOpenText, Files} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {Card, CardHeader, CardTitle} from "@/components/ui/card.tsx";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/registry/new-york/ui/select"

interface AccountSwitcherProps {
    isCollapsed: boolean
}

const links = [
    {
        label: "Notes",
        link: "/notes",
        icon: (
            <Files/>
        ),
    },
    {
        label: "Study Sessions",
        link: "/sessions",
        icon: (
            <BookOpenText/>
        ),
    },
]

export function AccountSwitcher({isCollapsed}: AccountSwitcherProps) {

    const navigate = useNavigate()
    const location = useLocation(); // Get the current route's location

    // Calculate the selected account based on the current path
    const selectedAccount = links.find(link => link.link === location.pathname)?.link || "/notes";

    const handleValueChange = (value: string) => {
        console.log("change menu", value)
        navigate(value) // Navigate to the selected route using React Router
    }


    return (
        <>
            <Tabs  defaultValue="notes" className="w-full"
                   onValueChange={handleValueChange}
                   value={selectedAccount}
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="/notes">Notes</TabsTrigger>
                    <TabsTrigger value="/sessions">Study Sessions</TabsTrigger>
                </TabsList>
            </Tabs>
            {/*<Select defaultValue={selectedAccount} onValueChange={handleValueChange}>*/}
            {/*    <SelectTrigger*/}
            {/*        className={cn(*/}
            {/*            "flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",*/}
            {/*            isCollapsed &&*/}
            {/*            "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"*/}
            {/*        )}*/}
            {/*        aria-label="Click here to change between notes and study sessions."*/}
            {/*    >*/}
            {/*        <SelectValue placeholder="Click here to change between notes and study sessions.">*/}
            {/*            {links.find((link) => link.link === selectedAccount)?.icon}*/}
            {/*            <span className={cn("ml-2", isCollapsed && "hidden")}>*/}
            {/*        {links.find((link) => link.link === selectedAccount)?.label}*/}
            {/*        </span>*/}
            {/*        </SelectValue>*/}
            {/*    </SelectTrigger>*/}
            {/*    <SelectContent>*/}
            {/*        {links.map((link) => (*/}
            {/*            <SelectItem key={link.label} value={link.link}>*/}
            {/*                <div*/}
            {/*                    className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">*/}
            {/*                    {link.icon}*/}
            {/*                    <span>{link.label}</span>*/}
            {/*                </div>*/}
            {/*            </SelectItem>*/}
            {/*        ))}*/}
            {/*    </SelectContent>*/}
            {/*</Select>*/}
        </>
    )
}
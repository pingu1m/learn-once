import * as React from "react"

import {cn} from "@/lib/utils"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {useNavigate} from "react-router-dom";
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
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <title>Vercel</title>
                <path d="M24 22.525H0l12-21.05 12 21.05z" fill="currentColor"/>
            </svg>
        ),
    },
    {
        label: "Sessions",
        link: "/sessions",
        icon: (
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <title>Gmail</title>
                <path
                    d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
                    fill="currentColor"
                />
            </svg>
        ),
    },
]

export function AccountSwitcher({isCollapsed}: AccountSwitcherProps) {

    const navigate = useNavigate()
    const [selectedAccount, setSelectedAccount] = React.useState<string>(links[0].link)

    const handleValueChange = (value: string) => {
        setSelectedAccount(value)
        navigate(value) // Navigate to the selected route using React Router
    }


    return (
        <Select defaultValue={selectedAccount} onValueChange={handleValueChange}>
            <SelectTrigger
                className={cn(
                    "flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
                    isCollapsed &&
                    "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"
                )}
                aria-label="Select account"
            >
                <SelectValue placeholder="Select an account">
                    {links.find((link) => link.link === selectedAccount)?.icon}
                    <span className={cn("ml-2", isCollapsed && "hidden")}>
                    {links.find((link) => link.link === selectedAccount)?.label}
                    </span>
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {links.map((link) => (
                    <SelectItem key={link.label} value={link.link}>
                        <div
                            className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
                            {link.icon}
                            <span>{link.label}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
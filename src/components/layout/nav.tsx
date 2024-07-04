import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {buttonVariants} from "@/components/ui/button.tsx";
import {Link} from "react-router-dom";

interface NavProps {
    isCollapsed: boolean
    links: {
        title: string
        label?: string
        icon: LucideIcon
        variant: "default" | "ghost"
        href: string
    }[]
}

export function Nav({ links, isCollapsed }: NavProps) {
    return (
        <div
            data-collapsed={isCollapsed}
            className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
        >
            <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
                {links.map((link, index) =>
                        isCollapsed ? (
                            <Tooltip key={index} delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Link
                                        // className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                                        className={cn(
                                            buttonVariants({ variant: link.variant, size: "icon" }),
                                            "h-9 w-9",
                                            link.variant === "default" &&
                                            "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                                        )}
                                        to={link.href}>
                                        {/*<FolderIcon className="h-4 w-4"/> /!* Assuming you have a suitable icon for "Cards" *!/*/}
                                        {/*Cards*/}
                                        <link.icon className="h-4 w-4" />
                                        <span className="sr-only">{link.title}</span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="flex items-center gap-4">
                                    {link.title}
                                    {link.label && (
                                        <span className="ml-auto text-muted-foreground">
                    {link.label}
                  </span>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Link
                                key={index}
                                // className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                                className={cn(
                                    buttonVariants({ variant: link.variant, size: "sm" }),
                                    link.variant === "default" &&
                                    "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                                    "justify-start"
                                )}
                                // className={cn(
                                //     buttonVariants({ variant: link.variant, size: "icon" }),
                                //     "h-9 w-9",
                                //     link.variant === "default" &&
                                //     "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                                // )}
                                to={link.href}>
                                {/*<FolderIcon className="h-4 w-4"/> /!* Assuming you have a suitable icon for "Cards" *!/*/}
                                {/*Cards*/}
                                {/*<link.icon className="h-4 w-4" />*/}
                                {/*<span className="sr-only">{link.title}</span>*/}
                                <link.icon className="mr-2 h-4 w-4" />
                                {link.title}
                                {link.label && (
                                    <span
                                        className={cn(
                                            "ml-auto",
                                            link.variant === "default" &&
                                            "text-background dark:text-white"
                                        )}
                                    >
                  {link.label}
                </span>
                                )}
                            </Link>
                        )
                )}
            </nav>
        </div>
    )
}
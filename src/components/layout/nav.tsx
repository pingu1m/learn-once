import {LucideIcon} from "lucide-react"
import {NavLink} from "react-router-dom";
import {cn} from "@/lib/utils"
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Button, buttonVariants} from "@/components/ui/button.tsx";
import {invoke} from "@tauri-apps/api/core";
import {apiCall} from "@/util.ts";

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

export function Nav({links, isCollapsed}: NavProps) {
    const getCall = (funName: string) => async () => {
        try {
            const newMessage = await apiCall(funName);
            // setResult([newMessage as unknown as string, false]);
        } catch (e) {
            console.error(e);
            // setResult([`${e}`, true]);
        }
    };
    async function test() {
        // await sendMessage(renameClassifier({newName: name, id: currentClassifier.id}));
        console.log("---------------------------------------------------")
        let name = "felipe"
        // const answer = await invoke<IpcMessage>("ipc_message", {message});
        // console.log(answer)
        let res = await invoke("greet", { name });
        console.log(res)
    }
    return (
        <div data-collapsed={isCollapsed}
             className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2">
            <Button color="primary" type="button" onClick={test}>Test</Button>
            <Button onClick={getCall("create_tables")}>Create DB</Button>
            <Button onClick={getCall("fill_tables")}>Fill DB</Button>
            <nav
                className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
                {links.map((link, index) =>
                    isCollapsed ? (
                        <NavLink
                            className={({isActive, isPending}) => {
                                return cn(
                                    (isActive) ? buttonVariants({
                                        variant: "default",
                                        size: "sm"
                                    }) : buttonVariants({variant: "ghost", size: "sm"}),
                                    link.variant === "default" &&
                                    "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                                    "justify-start"
                                )
                            }}
                            to={link.href}>
                            <Tooltip key={index} delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <div>
                                        <link.icon className="h-4 w-4"/>
                                        <span className="sr-only">{link.title}</span>
                                    </div>
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
                        </NavLink>
                    ) : (
                        <NavLink
                            key={index}
                            className={({isActive, isPending}) => {
                                return cn(
                                    (isActive) ? buttonVariants({
                                        variant: "default",
                                        size: "sm"
                                    }) : buttonVariants({variant: "ghost", size: "sm"}),
                                    link.variant === "default" &&
                                    "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                                    "justify-start"
                                )
                            }}
                            to={link.href}>
                            <link.icon className="mr-2 h-4 w-4"/>
                            {link.title}
                            {link.label && (
                                <span
                                    className={cn(
                                        "ml-auto",
                                        link.variant === "default" &&
                                        "text-background dark:text-white"
                                    )}>{link.label}
                                </span>
                            )}
                        </NavLink>
                    )
                )}

            </nav>
        </div>
    )
}
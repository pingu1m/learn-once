import {Route, Routes} from "react-router-dom";
import {TooltipProvider} from "@/components/ui/tooltip.tsx";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable.tsx";
import {cn} from "@/lib/utils.ts";
import {AccountSwitcher} from "@/pages/notes/account-switcher.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {
    AlertCircle,
    Archive,
    ArchiveX,
    File,
    Inbox,
    MessagesSquare,
    Send,
    ShoppingCart,
    Trash2,
    Users2
} from "lucide-react";
import * as React from "react";
import {accounts} from "@/data.tsx";
import {Notes} from "@/pages/notes/notes.tsx";
import {Cards} from "@/pages/cards/cards.tsx";
import {Nav} from "@/components/layout/nav.tsx";

const NoMatch = () => {
    return (<p>There's nothing here: 404!</p>);
};

function Main() {
    const defaultLayout = [265, 440, 655]
    const defaultCollapsed = false
    const navCollapsedSize = 4
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
    return (
        <TooltipProvider delayDuration={0}>
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={(sizes: number[]) => {
                    document.cookie = `react-resizable-panels:layout=${JSON.stringify(
                        sizes
                    )}`
                }}
                // className="h-full max-h-[800px] items-stretch"
                className="h-full max-h-screen items-stretch"
            >
                <ResizablePanel
                    defaultSize={defaultLayout[0]}
                    collapsedSize={navCollapsedSize}
                    collapsible={true}
                    minSize={15}
                    maxSize={20}
                    onCollapse={(collapsed) => {
                        setIsCollapsed(collapsed)
                        document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                            collapsed
                        )}`
                    }}
                    className={cn(
                        isCollapsed &&
                        "min-w-[50px] transition-all duration-300 ease-in-out"
                    )}
                >
                    <div
                        className={cn(
                            "flex h-[52px] items-center justify-center",
                            isCollapsed ? "h-[52px]" : "px-2"
                        )}
                    >
                        <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts}/>
                    </div>
                    <Separator/>
                    <Nav
                        isCollapsed={isCollapsed}
                        links={[
                            {
                                title: "Notes",
                                label: "128",
                                icon: Inbox,
                                variant: "default",
                                href: "/notes",
                            },
                            {
                                title: "Drafts",
                                label: "9",
                                icon: File,
                                variant: "ghost",
                                href: "/cards",
                            },
                            {
                                title: "Sent",
                                label: "",
                                icon: Send,
                                variant: "ghost",
                                href: "/cards",
                            },
                            {
                                title: "Junk",
                                label: "23",
                                icon: ArchiveX,
                                variant: "ghost",
                                href: "/cards",
                            },
                            {
                                title: "Trash",
                                label: "",
                                icon: Trash2,
                                variant: "ghost",
                                href: "/cards",
                            },
                            {
                                title: "Archive",
                                label: "",
                                icon: Archive,
                                variant: "ghost",
                                href: "/cards",
                            },
                        ]}
                    />
                    <Separator/>
                    <Nav
                        isCollapsed={isCollapsed}
                        links={[
                            {
                                title: "Social",
                                label: "972",
                                icon: Users2,
                                variant: "ghost",
                                href: "/cards",
                            },
                            {
                                title: "Updates",
                                label: "342",
                                icon: AlertCircle,
                                variant: "ghost",
                                href: "/cards",
                            },
                            {
                                title: "Forums",
                                label: "128",
                                icon: MessagesSquare,
                                variant: "ghost",
                                href: "/cards",
                            },
                            {
                                title: "Shopping",
                                label: "8",
                                icon: ShoppingCart,
                                variant: "ghost",
                                href: "/cards",
                            },
                            {
                                title: "Promotions",
                                label: "21",
                                icon: Archive,
                                variant: "ghost",
                                href: "/cards",
                            },
                        ]}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle/>
                <Routes>
                    <Route index element={<Notes/>}/>
                    <Route path="notes" element={<Notes/>}/>
                    <Route path="cards" element={<Cards/>}/>
                    <Route path="*" element={<NoMatch/>}/>
                </Routes>
            </ResizablePanelGroup>
        </TooltipProvider>

    )
}

export default Main;
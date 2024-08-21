import {Route, Routes} from "react-router-dom";
import {TooltipProvider} from "@/components/ui/tooltip.tsx";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable.tsx";
import {cn} from "@/lib/utils.ts";
import {AccountSwitcher} from "@/pages/notes/account-switcher.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {File, Inbox, Settings} from "lucide-react";
import * as React from "react";
import {accounts} from "@/data.tsx";
import {Notes} from "@/pages/notes/notes.tsx";
import {Cards} from "@/pages/sessions/cards.tsx";
import {Nav} from "@/components/layout/nav.tsx";
import {Sessions} from "@/pages/sessions/sessions.tsx";

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
                className="h-full max-h-screen items-stretch"
            >
                <ResizablePanel
                    defaultSize={defaultLayout[0]}
                    collapsedSize={navCollapsedSize}
                    collapsible={true}
                    minSize={15}
                    maxSize={20}
                    onResize={(x) => {
                        if (x == navCollapsedSize) {
                            setIsCollapsed(true)
                        } else {
                            setIsCollapsed(false)
                        }
                    }}
                    className={cn(
                        "flex flex-col justify-between",
                        isCollapsed &&
                        "min-w-[50px] transition-all duration-300 ease-in-out"
                    )}
                >
                    <div>
                        <div
                            className={cn(
                                "flex h-[52px] items-center justify-center",
                                isCollapsed ? "h-[52px]" : "px-2"
                            )}
                        >
                            <AccountSwitcher isCollapsed={isCollapsed} />
                        </div>
                        <Separator/>
                        <Nav
                            isCollapsed={isCollapsed}
                            links={[
                                {title: "Notes", label: "128", icon: Inbox, variant: "default", href: "/notes",},
                                {title: "Sessions", label: "9", icon: File, variant: "ghost", href: "/sessions",},
                            ]}
                        />
                        <Separator/>
                        <small className="p-4">
                            labels
                        </small>
                    </div>
                    <div>
                        <Nav
                            isCollapsed={isCollapsed}
                            links={[
                                {title: "Settings", label: "972", icon: Settings, variant: "default", href: "/cards",},
                            ]}
                        />

                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle/>
                <Routes>
                    <Route index element={<Notes/>}/>
                    <Route path="notes" element={<Notes/>}/>
                    <Route path="sessions" element={<Sessions/>}/>
                    <Route path="*" element={<NoMatch/>}/>
                </Routes>
            </ResizablePanelGroup>
        </TooltipProvider>

    )
}

export default Main;
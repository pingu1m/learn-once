import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable.tsx";
import {ScrollArea} from "@/components/ui/scroll-area";
// import {Button} from "@/components/ui/button";
// import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {useSessions} from "@/components/notes/noteApi.ts";
import {SessionList} from "@/pages/sessions/session-list.tsx";
import {SessionDisplay} from "@/pages/sessions/session-display.tsx";
import useAppStore from "@/store/useAppStore.ts";
import {Top} from "@/components/layout/top.tsx";
import * as React from "react";
import {Separator} from "@/components/ui/separator.tsx";
import {Bottom} from "@/components/layout/bottom.tsx";


export function Sessions({}: {}) {
    const defaultLayout = [265, 40, 60]
    const {data: sessions, isLoading, isError} = useSessions();
    const editingSession = useAppStore(state => state.editingSession);

    return (
        <>
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={(sizes: number[]) => {
                    document.cookie = `react-resizable-panels:layout=${JSON.stringify(
                        sizes
                    )}`
                }}
                className="h-full max-h-screen items-stretch"
            >
                <ResizablePanel className="h-screen" defaultSize={defaultLayout[1]} minSize={30}>
                    <div className="h-screen flex flex-col items-stretch justify-between">
                        <Top/>
                        <ScrollArea className="h-screen pb-2">
                            <div className="flex flex-col gap-2">
                                {sessions ? <SessionList items={sessions}/> : <span>No Study Sessions</span>}
                            </div>
                        </ScrollArea>
                        <Bottom />
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle/>
                <ResizablePanel defaultSize={defaultLayout[2]}>
                    {isLoading ? (
                        <div>Loading...</div> // You can replace this with a loader component
                    ) : isError ? (
                        <div>Error loading note.</div> // You can replace this with an error component
                    ) : (
                        <SessionDisplay editingSession={editingSession}/>
                    )}
                </ResizablePanel>
            </ResizablePanelGroup>
        </>
    )
}
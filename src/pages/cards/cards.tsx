import * as React from "react"
import {Search,} from "lucide-react"

import {notes} from "@/data.tsx"
import {ResizableHandle, ResizablePanel} from "@/components/ui/resizable.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {Input} from "@/components/ui/input.tsx";
import {NoteList} from "@/pages/notes/note-list.tsx";
import {NoteDisplay} from "@/pages/notes/note-display.tsx";
import {useMail} from "@/store/use-mail.ts";

// import { useMail } from "@/app/(app)/examples/mail/use-mail"

interface MailProps {
}

export function Cards({}: MailProps) {
    const [mail] = useMail()
    const defaultLayout = [265, 440, 655]

    // @ts-ignore
    return (
        <>
            <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                <Tabs defaultValue="all">
                    <div className="flex items-center px-4 py-2">
                        <h1 className="text-xl font-bold">Cards</h1>
                        <TabsList className="ml-auto">
                            <TabsTrigger
                                value="all"
                                className="text-zinc-600 dark:text-zinc-200"
                            >
                                All mail
                            </TabsTrigger>
                            <TabsTrigger
                                value="unread"
                                className="text-zinc-600 dark:text-zinc-200"
                            >
                                Unread
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <Separator/>
                    <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <form>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                                <Input placeholder="Search" className="pl-8"/>
                            </div>
                        </form>
                    </div>
                    <TabsContent value="all" className="m-0">
                        <NoteList items={notes}/>
                    </TabsContent>
                    <TabsContent value="unread" className="m-0">
                        <NoteList items={notes.filter((item) => !item.favorite)}/>
                    </TabsContent>
                </Tabs>
            </ResizablePanel>
            <ResizableHandle withHandle/>
            <ResizablePanel defaultSize={defaultLayout[2]}>
            </ResizablePanel>
        </>
    )
}
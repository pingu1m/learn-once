import * as React from "react"
import {Search,} from "lucide-react"

import {ResizableHandle, ResizablePanel} from "@/components/ui/resizable.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {Input} from "@/components/ui/input.tsx";
// import {Payment, columns} from "@/pages/sessions/columns.tsx";
import {useEffect, useState} from "react";
import {Payment, columns} from "@/pages/sessions/data_table/columns.tsx";
import { DataTable } from "@/pages/sessions/data_table/data-table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {z} from "zod";
import {taskSchema} from "@/pages/sessions/data_table/data.tsx";

// import { useMail } from "@/app/(app)/examples/mail/use-mail"
// async function getData(): Promise<Payment[]> {
//     // Fetch data from your API here.
//     return [
//         {
//             id: "728ed52f",
//             amount: 100,
//             status: "pending",
//             email: "m@example.com",
//         },
//         // ...
//     ]
// }

async function getTasks() {
    const response = await fetch('/tasks.json');

    if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }

    const tasks = await response.json();

    return z.array(taskSchema).parse(tasks)
}

interface MailProps {
}

export function Sessions({}: MailProps) {
    // const [mail] = useMail()
    const defaultLayout = [265, 440, 655]
    // const data = await getData()
    const [data, setData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            // const temp = await getData()
            const temp = await getTasks()
            setData(temp)
        }

        fetchData().catch(console.error);
    }, []);

    // @ts-ignore
    return (
        <>
            <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                <Tabs defaultValue="all">
                    <div className="flex items-center px-4 py-2">
                        <h1 className="text-xl font-bold">Sessions</h1>
                        <TabsList className="ml-auto">
                            <TabsTrigger value="all" className="text-zinc-600 dark:text-zinc-200">
                                All
                            </TabsTrigger>
                            <TabsTrigger value="started" className="text-zinc-600 dark:text-zinc-200">
                                Started
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

                        <ScrollArea className="h-screen">
                            <div className="flex flex-col gap-2 p-4 pt-0">
                                <DataTable columns={columns} data={data}/>
                            </div>
                        </ScrollArea>
                        {/*<div className="container mx-auto py-10"> </div>*/}
                    </TabsContent>
                    <TabsContent value="started" className="m-0">
                        <span>in progress</span>
                    </TabsContent>
                </Tabs>
            </ResizablePanel>
            <ResizableHandle withHandle/>
            <ResizablePanel defaultSize={defaultLayout[2]}>
            </ResizablePanel>
        </>
    )
}
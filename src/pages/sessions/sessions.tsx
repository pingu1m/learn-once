import * as React from "react"
import {Search,} from "lucide-react"

import {ResizableHandle, ResizablePanel} from "@/components/ui/resizable.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {Input} from "@/components/ui/input.tsx";
// import {Payment, columns} from "@/pages/sessions/columns.tsx";
import {useEffect, useState} from "react";
import {columns} from "@/pages/sessions/data_table/columns.tsx";
import {DataTable} from "@/pages/sessions/data_table/data-table";
import {ScrollArea} from "@/components/ui/scroll-area";
import {z} from "zod";
import {sessionSchema} from "@/pages/sessions/data_table/data.tsx";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {NotesTable} from "@/pages/notes/table/data-table.tsx";
import {useNotes} from "@/components/notes/noteApi.ts";
import {notes_columns} from "@/pages/notes/table/columns.tsx";
import {AccountSwitcher} from "@/pages/notes/account-switcher.tsx";
import {accounts} from "@/data.tsx";
// import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
// import {Label} from "@/components/ui/label";
// import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";

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

async function getSessions() {
    const response = await fetch('/tasks.json');

    if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }

    const sessions = await response.json();

    return z.array(sessionSchema).parse(sessions)
}

interface MailProps {
}

const StudyCard = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Study session</CardTitle>
                <CardDescription>
                    Study your notes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
                >
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">
                            You have no products
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            You can start selling as soon as you add a product.
                        </p>
                        <Button className="mt-4">FLIP</Button>
                    </div>
                </div>

            </CardContent>
            <CardFooter className="justify-center border-t p-4">
                <Button className="mt-4 mr-2 ">Easy</Button>
                <Button className="mt-4 mr-2 ">Hard</Button>
                <Button className="mt-4 mr-2 ">Skip</Button>
                {/*<Button size="sm" variant="ghost" className="gap-1">*/}
                {/*    <PlusCircle className="h-3.5 w-3.5"/>*/}
                {/*    Add Variant*/}
                {/*</Button>*/}
            </CardFooter>
        </Card>

    )
}

export function Sessions({}: MailProps) {
    // const [mail] = useMail()
    const defaultLayout = [265, 440, 655]
    // const data = await getData()
    const [data, setData] = useState([])
    const {data: notes, isLoading, isError} = useNotes();

    useEffect(() => {
        const fetchData = async () => {
            // const temp = await getData()
            const temp = await getSessions()
            setData(temp)
        }
        // setData(notes);

        fetchData().catch(console.error);
    }, []);

    // @ts-ignore
    return (
        <>
            <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                <Tabs defaultValue="all">
                    <div className="flex items-center px-4 py-2">
                        <AccountSwitcher isCollapsed={false} />
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
                {/*<StudyCard/>*/}
                {notes && <NotesTable columns={notes_columns} data={notes} />}
            </ResizablePanel>
        </>
    )
}
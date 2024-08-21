import {Search,} from "lucide-react"
import {ResizableHandle, ResizablePanel} from "@/components/ui/resizable.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {Input} from "@/components/ui/input.tsx";
import {NoteList} from "@/pages/notes/note-list.tsx";
import {NoteDisplay} from "@/pages/notes/note-display.tsx";
import useNoteStore from "@/store/useNoteStore.ts";
import {useEffect, useState} from "react";
// import * as sea from "node:sea";
import {useDeleteNote, useNotes} from "@/components/notes/noteApi.ts";
import {AccountSwitcher} from "@/pages/notes/account-switcher.tsx";
import {accounts} from "@/data.tsx";
import * as React from "react";

export function Notes() {
    const defaultLayout = [265, 440, 655]
    const {data: notes, isLoading, isError} = useNotes();
    const [searchData, setSearchData] = useState(notes);
    const editingNote = useNoteStore(state => state.editingNote);
    // const { mutate: deleteNote } = useDeleteNote();
    // const setSelectedNote = useNoteStore((state) => state.setSelectedNote);

    console.log("---------------------------------------------------------")
    console.log(notes)

    // {cards?.map((card: Card) => (
    //     <li key={card.id}>
    //         <div>
    //             <strong>{card.title}</strong>
    //             <button onClick={() => setSelectedCard(card)}>Edit</button>
    //             <button onClick={() => deleteCard(card.id)}>Delete</button>
    //         </div>
    //         <p>{card.front}</p>
    //     </li>
    // ))}


    useEffect(() => {
        setSearchData(notes)
    }, [notes]);

    const searchItem = (query) => {
        if (!query) {
            // setSearchData(notes);
            return;
        }
        query = query.toLowerCase();

        const finalResult = [];
        // notes.forEach((item) => {
        //     if (
        //         item.title.toLowerCase().indexOf(query) !== -1 ||
        //         item.labels.includes(query)
        //     ) {
        //         finalResult.push(item);
        //     }
        // });
        // setSearchData(finalResult);
    };

    return (
        <>
            <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                {isLoading ? (
                    <div>Loading...</div> // You can replace this with a loader component
                ) : isError ? (
                    <div>Error loading note.</div> // You can replace this with an error component
                ) : (
                    <Tabs defaultValue="all">
                        <div className="flex items-center px-4 py-2">
                            <AccountSwitcher isCollapsed={false} />
                            {/*<h1 className="text-xl font-bold">Notes</h1>*/}
                            <TabsList className="ml-auto">
                                <TabsTrigger
                                    value="all"
                                    className="text-zinc-600 dark:text-zinc-200"
                                >
                                    All
                                </TabsTrigger>
                                <TabsTrigger
                                    value="unread"
                                    className="text-zinc-600 dark:text-zinc-200"
                                >
                                    Favorite
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <Separator/>
                        <div
                            className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                            <form>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                                    <Input placeholder="Search" className="pl-8"
                                           onChange={(e) => searchItem(e.target.value)}
                                    />
                                </div>
                            </form>
                        </div>
                        {isLoading ? (
                            <div>Loading...</div> // You can replace this with a loader component
                        ) : isError ? (
                            <div>Error loading note.</div> // You can replace this with an error component
                        ) : (
                            <>
                                <TabsContent value="all" className="m-0">
                                    {/*{JSON.stringify(notes)}*/}
                                    <NoteList items={notes}/>
                                </TabsContent>
                                <TabsContent value="unread" className="m-0">
                                    {JSON.stringify(notes)}
                                    {/*<NoteList items={notes.filter((item) => !item.favorite)}/>*/}
                                </TabsContent>
                            </>
                        )}
                    </Tabs>
                )}
            </ResizablePanel>
            <ResizableHandle withHandle/>
            <ResizablePanel defaultSize={defaultLayout[2]}>
                {isLoading ? (
                    <div>Loading...</div> // You can replace this with a loader component
                ) : isError ? (
                    <div>Error loading note.</div> // You can replace this with an error component
                ) : (
                    <NoteDisplay editingNote={editingNote}/>
                )}
            </ResizablePanel>
        </>
    )
}
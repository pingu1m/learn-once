// @ts-nocheck
import formatDistanceToNow from "date-fns/formatDistanceToNow"
import {cn} from "@/lib/utils"
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import useAppStore from "@/store/useAppStore.ts";
import {HeartFilledIcon} from "@radix-ui/react-icons";
import {Heart} from "lucide-react";
import {Note} from "@/types/Note.ts";

interface Props {
    items: Note[]
}

export function NoteList({items}: Props) {
    const [editingNote, setEditingNote] = useAppStore(state => [state.editingNote, state.setEditingNote]);

    return (
        <ScrollArea className="">
            <div className="flex flex-col gap-2 p-4 pt-0">
                {items && items.map((item) => (
                    <button
                        key={item.id}
                        className={cn(
                            "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                            editingNote && editingNote.id === item.id && "bg-muted"
                        )}
                        onClick={() => setEditingNote(item)}
                    >
                        <div className="flex w-full flex-col gap-1">
                            <div className="flex items-center">
                                <div className="flex items-center gap-2">
                                    <div className="font-semibold">{item.title}</div>
                                    {item.favorite ?
                                        <HeartFilledIcon className="mr-2 h-4 w-4 text-red-600"/> :
                                        <Heart className="mr-2 h-4 w-4"/>}
                                </div>
                                <div
                                    className={cn(
                                        "ml-auto text-xs",
                                        editingNote && editingNote.id === item.id
                                            ? "text-foreground"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {formatDistanceToNow(new Date(item.date), {
                                        addSuffix: true,
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="line-clamp-2 text-xs text-muted-foreground">
                            {item.text.substring(0, 300)}
                        </div>
                    </button>
                ))}
            </div>
        </ScrollArea>
    )
}
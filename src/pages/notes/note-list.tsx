import {ComponentProps} from "react"
import formatDistanceToNow from "date-fns/formatDistanceToNow"

import {cn} from "@/lib/utils"
import {Note} from "@/data.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import useNoteStore from "@/store/useNoteStore.ts";

interface MailListProps {
    items: Note[]
}

export function NoteList({items}: MailListProps) {
    const [editingNote, setEditingNote] = useNoteStore(state => [state.editingNote, state.setEditingNote]);

    return (
        <ScrollArea className="h-screen">
            <div className="flex flex-col gap-2 p-4 pt-0">
                {items.map((item) => (
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
                                    {!item.favorite && (
                                        <span className="flex h-4 w-4 rounded-full bg-blue-600">fav</span>
                                    )}
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
                            {/*<div className="text-xs font-medium">{item.subject}</div>*/}
                        </div>
                        <div className="line-clamp-2 text-xs text-muted-foreground">
                            {item.text.substring(0, 300)}
                        </div>
                        {item.labels.length ? (
                            <div className="flex items-center gap-2">
                                {item.labels.map((label) => (
                                    <Badge key={label} variant={getBadgeVariantFromLabel(label)}>
                                        {label}
                                    </Badge>
                                ))}
                            </div>
                        ) : null}
                    </button>
                ))}
            </div>
        </ScrollArea>
    )
}

function getBadgeVariantFromLabel(
    label: string
): ComponentProps<typeof Badge>["variant"] {
    if (["work"].includes(label.toLowerCase())) {
        return "default"
    }

    if (["personal"].includes(label.toLowerCase())) {
        return "outline"
    }

    return "secondary"
}
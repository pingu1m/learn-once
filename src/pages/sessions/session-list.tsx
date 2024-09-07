import formatDistanceToNow from "date-fns/formatDistanceToNow"
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import useAppStore from "@/store/useAppStore.ts";
import {Session} from "@/types/Session.ts";
import {cn} from "@/lib/utils.ts";

interface MailListProps {
    items: Session[]
}

export function SessionList({items}: MailListProps) {
    const [editingSession, setEditingSession] = useAppStore(state => [state.editingSession, state.setEditingSession]);

    const getFormatedDate = (date_str: string) => {
        console.log(date_str)
        try {
            // @ts-ignore
            return formatDistanceToNow(new Date(date_str), {addSuffix: true,})
        } catch (error) {
            return date_str
        }
    }

    return (
        <ScrollArea className="h-screen">
            <div className="flex flex-col gap-2 p-4 pt-0">
                {items && items.map((item) => (
                    <button
                        key={item.id}
                        className={cn(
                            "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                            editingSession && editingSession.id === item.id && "bg-muted"
                        )}
                        onClick={() => setEditingSession(item)}
                    >
                        <div className="flex w-full flex-col gap-1">
                            <div className="flex items-center">
                                <div className="flex items-center gap-2">
                                    <div className="font-semibold">{item.title}</div>
                                </div>
                                <div
                                    className={cn(
                                        "ml-auto text-xs",
                                        editingSession && editingSession.id === item.id
                                            ? "text-foreground"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {getFormatedDate(item?.latest_run)}
                                </div>
                            </div>
                            <div className="text-xs font-medium">Sessions run: {item?.session_count}</div>
                        </div>
                        <div className="line-clamp-2 text-xs text-muted-foreground">
                            Cards summary:
                        </div>
                    </button>
                ))}
            </div>
        </ScrollArea>
    )
}
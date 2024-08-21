import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"

// import { Button } from "@/registry/new-york/ui/button"
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuRadioGroup,
//     DropdownMenuRadioItem,
//     DropdownMenuSeparator,
//     DropdownMenuShortcut,
//     DropdownMenuSub,
//     DropdownMenuSubContent,
//     DropdownMenuSubTrigger,
//     DropdownMenuTrigger,
// } from "@/registry/new-york/ui/dropdown-menu"

// import { labels } from "./data"
// import { sessionSchema } from "./data"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    // DropdownMenuRadioGroup, DropdownMenuRadioItem,
    DropdownMenuSeparator, DropdownMenuShortcut,
    // DropdownMenuSub,
    // DropdownMenuSubContent,
    // DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
}

// @ts-ignore
export function DataTableRowActions<TData>({
                                               row,
                                           }: DataTableRowActionsProps<TData>) {
    // const session = sessionSchema.parse(row.original)
    // console.log(row)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                    <DotsHorizontalIcon className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Study</DropdownMenuItem>
                {/*<DropdownMenuItem>Favorite</DropdownMenuItem>*/}
                <DropdownMenuSeparator />
                {/*<DropdownMenuSub>*/}
                {/*    <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>*/}
                {/*    <DropdownMenuSubContent>*/}
                {/*        <DropdownMenuRadioGroup value={session.label}>*/}
                {/*            {labels.map((label) => (*/}
                {/*                <DropdownMenuRadioItem key={label.value} value={label.value}>*/}
                {/*                    {label.label}*/}
                {/*                </DropdownMenuRadioItem>*/}
                {/*            ))}*/}
                {/*        </DropdownMenuRadioGroup>*/}
                {/*    </DropdownMenuSubContent>*/}
                {/*</DropdownMenuSub>*/}
                {/*<DropdownMenuSeparator />*/}
                <DropdownMenuItem>
                    Delete
                    <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
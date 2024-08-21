import {ColumnDef} from "@tanstack/react-table"

// import {DataTableColumnHeader} from "./data-table-column-header"
// import {DataTableRowActions} from "./data-table-row-actions"
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {DataTableColumnHeader} from "@/pages/sessions/data_table/data-table-column-header.tsx";
import {DataTableRowActions} from "@/pages/sessions/data_table/data-table-row-actions.tsx";
import {Note} from "@/data.tsx";

export const notes_columns: ColumnDef<Note>[] = [
    {
        id: "select",
        header: ({table}) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({row}) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Id"/>
        ),
        cell: ({row}) => {
            let id = row.getValue("id")
            return (
                <div className="w-[20px]">{id.substring(id.length - 4)}</div>
            )
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "title",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Title"/>
        ),
        cell: ({row}) => {
            return (
                <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("title")}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "language",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Language"/>
        ),
        cell: ({row}) => {
            // const status = statuses.find(
            //     (status) => status.value === row.getValue("status")
            // )
            //
            // if (!status) {
            //     return null
            // }

            return (
                <div className="flex w-[100px] items-center">
                    {row.getValue("language")}
                    {/*{status.icon && (*/}
                    {/*    <status.icon className="mr-2 h-4 w-4 text-muted-foreground"/>*/}
                    {/*)}*/}
                    {/*<span>{status.label}</span>*/}
                </div>
            )
        },
        // filterFn: (row, id, value) => {
        //     return value.includes(row.getValue(id))
        // },
    },
    {
        id: "actions",
        cell: ({row}) => <DataTableRowActions row={row}/>,
    },
]
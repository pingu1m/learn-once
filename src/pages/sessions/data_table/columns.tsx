import {ColumnDef} from "@tanstack/react-table"

// import { Badge } from "@/registry/new-york/ui/badge"
// import { Checkbox } from "@/registry/new-york/ui/checkbox"

import {labels, statuses} from "./data"
import {Session} from "./data"
import {DataTableColumnHeader} from "./data-table-column-header"
import {DataTableRowActions} from "./data-table-row-actions"
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Button} from "@/components/ui/button.tsx";

export const columns: ColumnDef<Session>[] = [
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
            <DataTableColumnHeader column={column} title="Session"/>
        ),
        cell: ({row}) => <div className="w-[80px]">{row.getValue("id")}</div>,
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "title",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Title"/>
        ),
        cell: ({row}) => {
            const label = labels.find((label) => label.value === row.original.label)

            return (
                <div className="flex space-x-2">
                    {label && <Badge variant="outline">{label.label}</Badge>}
                    <span className="max-w-[500px] truncate font-medium">
            {row.getValue("title")}
          </span>
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Status"/>
        ),
        cell: ({row}) => {
            const status = statuses.find(
                (status) => status.value === row.getValue("status")
            )

            if (!status) {
                return null
            }

            return (
                <div className="flex w-[100px] items-center">
                    {status.icon && (
                        <status.icon className="mr-2 h-4 w-4 text-muted-foreground"/>
                    )}
                    <span>{status.label}</span>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "priority",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Study"/>
        ),
        cell: ({row}) => {
            const idVal = row.getValue("id")

            return (
                <div className="flex items-center">
                    <Button
                        onClick={() => console.log(idVal)}
                        className="h-8 px-2 lg:px-3 mr-2"
                    >
                        Study
                    </Button>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        id: "actions",
        cell: ({row}) => <DataTableRowActions row={row}/>,
    },
]
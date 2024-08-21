import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/registry/new-york/ui/table"

// import { DataTableToolbar } from "./data-table-toolbar"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {DataTablePagination} from "@/components/table/data-table-pagination.tsx";
import {Input} from "@/components/ui/input.tsx";
import {DataTableFacetedFilter} from "@/pages/sessions/data_table/data-table-faceted-filter.tsx";
import {priorities, statuses} from "@/pages/sessions/data_table/data.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Cross2Icon} from "@radix-ui/react-icons";
import {DataTableViewOptions} from "@/pages/sessions/data_table/data-table-view-options.tsx";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function NotesTable<TData, TValue>({
                                             columns,
                                             data,
                                         }: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [sorting, setSorting] = React.useState<SortingState>([])

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
        },
        enableRowSelection: true,
        // enableMultiRowSelection: false,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    return (
        <div className="space-y-4 m-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center space-x-2">
                    <Input
                        placeholder="Filter sessions..."
                        value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("title")?.setFilterValue(event.target.value)
                        }
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                    {/*{table.getColumn("status") && (*/}
                    {/*    <DataTableFacetedFilter*/}
                    {/*        column={table.getColumn("status")}*/}
                    {/*        title="Status"*/}
                    {/*        options={statuses}*/}
                    {/*    />*/}
                    {/*)}*/}
                    {/*{table.getColumn("priority") && (*/}
                    {/*    <DataTableFacetedFilter*/}
                    {/*        column={table.getColumn("priority")}*/}
                    {/*        title="Priority"*/}
                    {/*        options={priorities}*/}
                    {/*    />*/}
                    {/*)}*/}
                </div>
                {/*<div>*/}
                {/*    <Button*/}
                {/*        onClick={() => table.resetColumnFilters()}*/}
                {/*        disabled={table.getFilteredSelectedRowModel().rows.length == 0}*/}
                {/*        className="h-8 px-2 lg:px-3 mr-2"*/}
                {/*    >*/}
                {/*        Edit*/}
                {/*        <Cross2Icon className="ml-2 h-4 w-4" />*/}
                {/*    </Button>*/}
                {/*    <Button*/}
                {/*        onClick={() => table.resetColumnFilters()}*/}
                {/*        disabled={table.getFilteredSelectedRowModel().rows.length == 0}*/}
                {/*        className="h-8 px-2 lg:px-3 mr-2"*/}
                {/*    >*/}
                {/*        Study*/}
                {/*        <Cross2Icon className="ml-2 h-4 w-4" />*/}
                {/*    </Button>*/}
                {/*</div>*/}
                {/*<DataTableViewOptions table={table}/>*/}
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table}/>
        </div>
    )
}
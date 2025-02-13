// src/components/network/NetworkTable.tsx
"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { NetworkReport } from "@/types/network"; // Import your type
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface NetworkTableProps {
  reports: NetworkReport[];
}

export const NetworkTable: React.FC<NetworkTableProps> = ({ reports }) => {

    const [sorting, setSorting] = useState<SortingState>([]);

    const columns: ColumnDef<NetworkReport>[] = [
        {
            accessorKey: "numeroReporte",
            header: "Reporte",
            enableSorting: true,
            cell: ({ row }) => <div>{row.getValue("numeroReporte")}</div>,
        },
        {
            accessorKey: "fechaIncidente",
            header: "Fecha Incidente",
            enableSorting: true,
            cell: ({ row }) => <div>{new Date(row.getValue("fechaIncidente")).toLocaleDateString()}</div>,
        },
        {
            accessorKey: "ubicacion",
            header: "Ubicación",
            cell: ({ row }) => <div>{row.getValue("ubicacion") || "N/A"}</div>
        },
        {
            accessorKey: "tipo",
            header: "Tipo",
            cell: ({ row }) => <div>{row.getValue("tipo")}</div>
        },
        {
            accessorKey: "estado",
            header: "Estado",
            cell: ({ row }) => <div>{row.getValue("estado")}</div>,
        },
        {
          id: "actions",
          cell: ({ row }) => (
           <Link href={`/v1/reports/network/${row.original.id}/viewdetail`}>
                <Button size="sm" variant="secondary">Ver</Button>
            </Link>
          ),
        },
      ];

  const table = useReactTable({
    data: reports,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });
  return (
     <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}
                     onClick={
                        header.column.getCanSort()
                          ? () => header.column.toggleSorting()
                          : undefined
                      }
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : ""
                      }
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                       {{
                        asc: " 🔼",
                        desc: " 🔽",
                      }[header.column.getIsSorted() as string] ?? null}
                    </TableHead>
                  );
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 py-4 p-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
             <ArrowLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}
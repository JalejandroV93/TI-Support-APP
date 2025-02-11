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
import { Usuario } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { UserActions } from "@/components/users/UserActions";
import { ArrowLeft, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { SkeletonTable } from "@/components/skeletons/SkeletonsUI";

interface UserTableProps {
  onEdit: (user: Usuario) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ onEdit }) => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refetch, setRefetch] = useState(false); // Flag para forzar el refetch

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Error fetching users:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refetch]);

  const handleRefetch = () => {
    setRefetch((prev) => !prev);
  };

  const columns: ColumnDef<Usuario>[] = [
    {
      accessorKey: "id",
      header: "ID",
      enableSorting: true,
      cell: ({ row }) => <div>{row.getValue("id")}</div>,
    },
    {
      accessorKey: "username",
      header: "Usuario",
      enableSorting: true,
      cell: ({ row }) => <div>{row.getValue("username")}</div>,
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
      enableSorting: true,
      cell: ({ row }) => <div>{row.getValue("nombre")}</div>,
    },
    {
      accessorKey: "rol",
      header: "Rol",
      cell: ({ row }) => <div>{row.getValue("rol")}</div>,
    },
    {
      accessorKey: "isBlocked",
      header: "Bloqueado",
      cell: ({ row }) => <div>{row.original.isBlocked ? "Sí" : "No"}</div>,
    },
    {
      accessorKey: "isDisabled",
      header: "Deshabilitado",
      cell: ({ row }) => <div>{row.original.isDisabled ? "Sí" : "No"}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <UserActions
          user={row.original}
          onEdit={onEdit}
          onRefetch={handleRefetch}
        />
      ),
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  if (isLoading) {
    return <SkeletonTable />;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter users..."
          value={
            (table.getColumn("username")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("username")?.setFilterValue(event.target.value)
          }
          className="max-w-sm hidden"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
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
  );
};

// src/components/admin-panel/settings/category-table.tsx
"use client";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
  } from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { useCategoryStore } from "@/store/categoryStore";
import { useCallback, useRef, useState, useMemo } from "react";  // Import useRef and useCallback
import useSWRInfinite from 'swr/infinite'; // Import
import { ScrollArea } from "@/components/ui/scroll-area";

interface Category {
    id: number;
    nombre: string;
    descripcion: string | null;
}

interface CategoryTableProps {
    onEdit: (category: Category) => void;
}

const PAGE_SIZE = 10;

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Debounce function (utility)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export const CategoryTable: React.FC<CategoryTableProps> = ({ onEdit }) => {

    const {  deleteCategory, fetchCategories } = useCategoryStore();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    const {
        data,
        error,
        size, // Current number of pages loaded.
        setSize, // Function to set the number of pages.
        isLoading
      } = useSWRInfinite(
        (pageIndex) => `/api/v1/settings/categories?page=${pageIndex + 1}&pageSize=${PAGE_SIZE}`,
        fetcher
      );

    const categories = useMemo(() => data ? data.reduce((acc, val) => acc.concat(val.categories), []) : [], [data]) as Category[];
    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
    const isEmpty = data?.[0]?.categories.length === 0;
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.categories.length < PAGE_SIZE);

      // Debounced version of setSize.
  const debouncedSetSize = useCallback(
    (newSize: number) => {
      const handler = debounce((size: number) => {
        setSize(size);
      }, 250); // 250ms debounce delay. Adjust as needed.
      handler(newSize);
    },
    [setSize]
  );

  const loadMore = useCallback(() => {
    if (isLoadingMore || isReachingEnd) return;
    debouncedSetSize(size + 1); // Use the debounced function.
  }, [isLoadingMore, isReachingEnd, debouncedSetSize, size]);

    // Intersection Observer for loading more.
    const observer = useRef<IntersectionObserver | null>(null);
    const lastReportRef = useCallback(
        (node: HTMLTableRowElement | null) => {
        if (isLoadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isReachingEnd) {
            loadMore();
            }
        });
        if (node) observer.current.observe(node);
        },
        [isLoadingMore, isReachingEnd, loadMore]
    );

    const handleDelete = async () => {
        if (categoryToDelete) {
          const isSuccess = await deleteCategory(categoryToDelete.id); // Use store action
          if (isSuccess) {
            fetchCategories()
          }
        }
        setIsDeleteDialogOpen(false);
    };

    const columns: ColumnDef<Category>[] = [
    {
        accessorKey: "nombre",
        header: "Nombre",
        cell: ({row}) => {
            return (
                <div className="capitalize">{row.getValue("nombre")}</div>
            )
        }
    },
    {
        accessorKey: "descripcion",
        header: "Descripción",
        cell: ({row}) => {
            return (
                <div className="capitalize">{row.getValue("descripcion")}</div>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
        const category = row.original;
        return (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => onEdit(category)}
                >
                Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {
                        setCategoryToDelete(category);
                        setIsDeleteDialogOpen(true);
                }}>
                Eliminar
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        );
        },
    },
    ];

    const table = useReactTable({
        data: categories,
        columns,
        getCoreRowModel: getCoreRowModel(),
      });

      if (error) return <div>failed to load</div>
      if (isLoading) return <div>Loading...</div>

    return (
        <>
        <div className="w-full">
        <ScrollArea className="h-[calc(100vh-280px)] w-full">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                            return (
                                <TableHead key={header.id}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                </TableHead>
                            );
                            })}
                        </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row, index) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                ref={index === categories.length - 1 ? lastReportRef : undefined}

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
        </ScrollArea>
        </div>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente la categoría.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    )
}
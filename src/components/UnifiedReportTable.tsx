// --- src/app/v1/(dashboard)/components/UnifiedReportTable.tsx (NEW FILE) ---
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
import { UnifiedReport } from "@/types/global";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import useSWRInfinite from "swr/infinite";
import { useCallback, useRef, useMemo } from "react";
import { debounce } from "@/lib/utils";
import { UnifiedReportTableSkeleton } from "@/components/skeletons/SkeletonsUI";

const PAGE_SIZE = 10;

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch unified reports");
    }
    return res.json();
};

export const UnifiedReportTable = () => {

  const { data, error, size, setSize, isLoading } = useSWRInfinite(
    (pageIndex) =>
      `/api/v1/reports/unified?page=${pageIndex + 1}&pageSize=${PAGE_SIZE}`,
    fetcher
  );

  const reports = useMemo(
    () =>
      data ? data.reduce((acc, val) => acc.concat(val.reports), []) : [],
    [data]
  ) as UnifiedReport[];

  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.reports.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.reports.length < PAGE_SIZE);

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
    (node: HTMLTableRowElement) => {
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

  const columns: ColumnDef<UnifiedReport>[] = [
    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: ({ row }) => {
        const date = new Date(row.getValue("fecha"));
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
    {
      accessorKey: "reportType",
      header: "Tipo de Reporte",
    },
    {
      accessorKey: "numeroReporte",
      header: "Número de Reporte",
    },
    {
      accessorKey: "usuario",
      header: "Usuario",
    },
    {
      accessorKey: "estado",
      header: "Estado",
    },
    {
        accessorKey: "descripcion",
        header: "Descripción",
      },
      {
        accessorKey: "ubicacion",
        header: "Ubicación",
      },
    {
      id: "actions",
      cell: ({ row }) => {
        const report = row.original;
        let viewDetailHref = "";

        switch (report.reportType) {
          case "Mantenimiento":
            viewDetailHref = `/v1/reports/maintenance/${report.id}/viewdetail`;
            break;
          case "Red":
            viewDetailHref = `/v1/reports/network/${report.id}/viewdetail`;
            break;
          case "Aula Movil":
            viewDetailHref = `/v1/reports/mobile-classrooms/${report.id}/viewdetail`;
            break;
          case "Soporte":
            viewDetailHref = `/v1/reports/support/${report.id}/viewdetail`;
            break;
        }

        return (
          <Link href={viewDetailHref}>
            <Button size="sm" variant="secondary">
              Ver Detalles
            </Button>
          </Link>
        );
      },
    },
  ];

  const table = useReactTable({
    data: reports,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (error) return <div>failed to load</div>;
    if (isLoading) return <UnifiedReportTableSkeleton />;

  return (
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
                        ref={
                            index === reports.length - 1 ? lastReportRef : undefined
                          }
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
  );
};
// src/app/v1/(dashboard)/reports/support/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SupportReportSkeleton } from "@/components/skeletons/SkeletonsUI"; // You'll need to create this
import { User, CheckCircle, XCircle, } from "lucide-react";
import { SupportReport } from "@/types/support"; // Import SupportReport type
import useSWRInfinite from "swr/infinite";
import { useCallback, useRef, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea
import ReportCard, { ReportCardDetail } from "@/components/ReportCard";  // Import ReportCard
import { debounce } from "@/lib/utils";  //NEW



const PAGE_SIZE = 10;

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch support reports");
  }
  return res.json();
};

const getStatusVariant = (status: string) => {
    switch (status) {
      case "ABIERTO":
        return "destructive";
      case "EN_PROCESO":
      case "PENDIENTE_POR_TERCERO":
        return "warning";
      case "RESUELTO":
        return "success";
      case "CERRADO":
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    return (
      status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase().replace("_", " ")
    );
  };

export default function SupportReportsPage() {
  const { data, error, size, setSize, isLoading } = useSWRInfinite(
    (pageIndex) =>
      `/api/v1/reports/support?page=${pageIndex + 1}&pageSize=${PAGE_SIZE}`,
    fetcher
  );

  const reports = useMemo(
    () => (data ? data.reduce((acc, val) => acc.concat(val.reports), []) : []),
    [data]
  ) as SupportReport[]; // Type assertion.

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
    (node: HTMLDivElement) => {
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



  if (error)
    return <div>Ocurrio un error al obtener los reportes de soporte.</div>;

  return (
    <div className="p-2">
      <div className="flex justify-end items-center mb-4">
        <Link href="/v1/reports/support/create">
          <Button>Agregar Reporte</Button>
        </Link>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)] w-full">
        {" "}
        {/* Adjust height as needed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reports.map((report, index) => {
            const details: ReportCardDetail[] = [
              {
                label: "Usuario",
                value: (
                  <>
                    <User className="w-4 h-4 inline-block mr-1" />
                    {report.usuario.nombre}
                  </>
                ),
              },
              {
                label: "Categoría",
                value: report.categoria.nombre,
              },
              {
                label: "Estado",
                value: report.fueSolucionado ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500 inline-block mr-1" />
                    <span className="text-green-600 font-medium">
                      Solucionado
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-500 inline-block mr-1" />
                    <span className="text-red-600 font-medium">
                      No Solucionado
                    </span>
                  </>
                ),
              },
            ];
            return (
              <ReportCard
                key={report.id}
                title={report.numeroReporte}
                date={report.fecha}
                details={details}
                badgeText={getStatusLabel(report.estado)}
                badgeVariant={getStatusVariant(report.estado)}
                viewDetailHref={`/v1/reports/support/${report.id}/viewdetail`}
                ref={
                  index === reports.length - 1 ? lastReportRef : undefined
                }
              />
            );
          })}
        </div>
        {isLoadingMore && <SupportReportSkeleton />}
        {!reports.length && !isLoading && (
          <p>No se encontraron reportes de soporte.</p>
        )}
      </ScrollArea>
    </div>
  );
}
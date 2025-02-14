// src/app/v1/(dashboard)/reports/network/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NetworkReport } from "@/types/network";
import useSWRInfinite from "swr/infinite";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NetworkReportSkeleton } from "@/components/skeletons/SkeletonsUI";
import { RedEstado } from "@prisma/client";
import { toast } from "sonner";
import { User } from "lucide-react";
import ReportCard, { ReportCardDetail } from "@/components/ReportCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { debounce } from "@/lib/utils";


const getStatusVariant = (status: RedEstado) => {
  switch (status) {
    case "ABIERTO":
      return "destructive";
    case "EN_PROCESO":
      return "warning";
    case "RESUELTO":
      return "success";
    case "CERRADO":
    default:
      return "secondary";
  }
};

const getStatusLabel = (status: RedEstado) => {
  return (
    status.charAt(0).toUpperCase() +
    status.slice(1).toLowerCase().replace("_", " ")
  );
};


const PAGE_SIZE = 10;

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch network reports");
  }
  return res.json();
};



export default function NetworkReportsPage() {
  const { data, error, size, setSize, isLoading } = useSWRInfinite(
    (pageIndex) =>
      `/api/v1/reports/network?page=${pageIndex + 1}&pageSize=${PAGE_SIZE}`,
    fetcher
  );

  const reports = useMemo(
    () => (data ? data.reduce((acc, val) => acc.concat(val.reports), []) : []),
    [data]
  ) as NetworkReport[];

  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.reports.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.reports.length < PAGE_SIZE);

  const debouncedSetSize = useCallback(
    (newSize: number) => {
      const handler = debounce((size: number) => {
        setSize(size);
      }, 250);
      handler(newSize);
    },
    [setSize]
  );

  const loadMore = useCallback(() => {
    if (isLoadingMore || isReachingEnd) return;
    debouncedSetSize(size + 1); // Use the debounced function.
  }, [isLoadingMore, isReachingEnd, debouncedSetSize, size]);

  // Intersection Observer para cargar más
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

  // Función para actualizar el estado del reporte
  const handleStatusChange = async (reportId: number, newStatus: RedEstado) => {
    try {
      const response = await fetch(
        `/api/v1/reports/network/route?id=${reportId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ estado: newStatus }),
        }
      );

      if (response.ok) {
        // Optimistic Update: Update local state immediately
        setReports(
            reports.map((report) =>
            report.id === reportId ? { ...report, estado: newStatus } : report
          )
        );

        toast.success(`Reporte ${reportId} actualizado a ${newStatus}`);
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.error || "Error al actualizar el estado del reporte"
        );
      }
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Error inesperado al actualizar el estado del reporte.");
    }
  };

  const [reportsList, setReports] = useState(reports);
  useEffect(() => {
    setReports(reports);
  }, [reports]);

  if (error) return <div>Ocurrió un error al obtener los reportes de red.</div>;

  return (
    <div className="p-2">
      <div className="flex justify-end items-center mb-4">
        <Link href="/v1/reports/network/create">
          <Button>Agregar Reporte</Button>
        </Link>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)] w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reportsList.map((report, index) => {


            const details: ReportCardDetail[] = [
              {
                label: "Técnico",
                value: (
                    <>
                        <User className="w-4 h-4 inline-block mr-1" />
                        {report.tecnico || "N/A"}
                    </>
                ),
              },
              {
                label: "Tipo de Reporte",
                value:
                  report.tipo === "DANIO"
                    ? "Daño"
                    : report.tipo.charAt(0).toUpperCase() +
                      report.tipo.slice(1).toLowerCase().replace("_", " "),
              },

            ];

            return (
              <ReportCard
                key={report.id}
                title={report.numeroReporte}
                date={report.fechaRegistro}
                badgeText={getStatusLabel(report.estado)}
                badgeVariant={getStatusVariant(report.estado)}
                details={details}
                viewDetailHref={`/v1/reports/network/${report.id}/viewdetail`}
                ref={
                  index === reports.length - 1 ? lastReportRef : undefined
                }
              >
                {/* Custom content for the status change */}
                <div className="mt-2">

                  <Select
                    value={report.estado}
                    onValueChange={(newValue) =>
                      handleStatusChange(report.id, newValue as RedEstado)
                    }

                  >
                    <SelectTrigger className="w-auto h-auto p-0 border-none"> {/* Remove padding, height and border*/}
                      <SelectValue >{getStatusLabel(report.estado)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(RedEstado).map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {getStatusLabel(estado)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </ReportCard>
            );
          })}
        </div>
        {isLoadingMore && <NetworkReportSkeleton />}
        {!reports.length && !isLoading && (
          <p>No se encontraron reportes de red.</p>
        )}
      </ScrollArea>
    </div>
  );
}
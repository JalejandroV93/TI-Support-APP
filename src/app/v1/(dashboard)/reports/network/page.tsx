"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NetworkReport } from "@/types/network";
import useSWRInfinite from "swr/infinite";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NetworkReportSkeleton } from "@/components/skeletons/SkeletonsUI";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RedEstado } from "@prisma/client";
import { toast } from "sonner";
import { Clipboard, User, Calendar, Eye } from "lucide-react";

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

const badgeClasses: Record<string, string> = {
  destructive: "bg-red-500 text-white",
  warning: "bg-yellow-500 text-white",
  success: "bg-green-500 text-white",
  secondary: "bg-gray-500 text-white",
};

const PAGE_SIZE = 10;

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch network reports");
  }
  return res.json();
};

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
    debouncedSetSize(size + 1);
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
        const updatedReports = reports.map((report) =>
          report.id === reportId ? { ...report, estado: newStatus } : report
        );
        setReports(updatedReports);
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
          {reportsList.map((report, index) => (
            <Card
              key={report.id}
              ref={index === reports.length - 1 ? lastReportRef : undefined}
              className="relative transition-transform ease-in-out hover:scale-[1.02] hover:shadow-lg"
            >
              {/* Badge de estado en la esquina superior derecha */}

              <CardHeader>
                <CardTitle className="flex flex-row gap-1 justify-between align-middle">
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-semibold">
                      Reporte de Red
                    </span>
                    <div className="flex items-center gap-2 text-sm">
                      <Clipboard className="w-5 h-5" />
                      <span>{report.numeroReporte}</span>
                    </div>
                  </div>
                  <div className="mt-1">
                    <Badge
                      className={` text-[10px] px-2 py-1 rounded ${
                        badgeClasses[getStatusVariant(report.estado)]
                      }`}
                    >
                      {getStatusLabel(report.estado)}
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(report.fechaRegistro), "PPP", {
                      locale: es,
                    })}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <p className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4" />
                  <span>{report.tecnico || "N/A"}</span>
                </p>
                <p className="text-sm">
                  <span>{report.tipo}</span>
                </p>
                {/* Actualización rápida del estado */}
                <div className="flex items-center gap-2">
                  <Select
                    value={report.estado}
                    onValueChange={(newValue) =>
                      handleStatusChange(report.id, newValue as RedEstado)
                    }
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue>{getStatusLabel(report.estado)}</SelectValue>
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
              </CardContent>

              <CardFooter className="flex justify-end">
                <Link href={`/v1/reports/network/${report.id}/viewdetail`}>
                <Button size="sm" variant="secondary" className="bg-red-700 text-white hover:bg-zinc-900">
                    <Eye className="w-4 h-4 mr-1" /> Ver
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        {isLoadingMore && <NetworkReportSkeleton />}
        {!reports.length && !isLoading && (
          <p>No se encontraron reportes de red.</p>
        )}
      </ScrollArea>
    </div>
  );
}

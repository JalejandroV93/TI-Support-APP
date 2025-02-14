// src/app/v1/(dashboard)/reports/mobile-classrooms/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import useSWRInfinite from "swr/infinite";
import { useCallback, useRef, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clipboard, Tablet, Calendar, Eye } from "lucide-react";
//import { MobileClassroomsReportSkeleton } from "@/components/skeletons/SkeletonsUI"; // You might need to create a new skeleton
import { MobileClassroomsReport } from "@/types/mobile-classrooms";
import { MobileClassroomsReportSkeleton } from "@/components/skeletons/SkeletonsUI";

const PAGE_SIZE = 10;

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch mobile classroom reports");
  }
  return res.json();
};

// Debounce function
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

export default function MobileClassroomsReportsPage() {
  const { data, error, size, setSize, isLoading } = useSWRInfinite(
    (pageIndex) =>
      `/api/v1/reports/mobile-classrooms?page=${
        pageIndex + 1
      }&pageSize=${PAGE_SIZE}`,
    fetcher
  );

  const reports = useMemo(
    () => (data ? data.reduce((acc, val) => acc.concat(val.reports), []) : []),
    [data]
  ) as MobileClassroomsReport[];

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
    return (
      <div>Ocurrió un error al obtener los reportes de aulas móviles.</div>
    );

  return (
    <div className="p-2">
      <div className="flex justify-end items-center mb-4">
        <Link href="/v1/reports/mobile-classrooms/create">
          <Button>Agregar Reporte</Button>
        </Link>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)] w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reports.map((report, index) => (
            <Card
              key={report.id}
              ref={index === reports.length - 1 ? lastReportRef : undefined}
              className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg"
            >
              <CardHeader>
                <CardTitle className="flex flex-row justify-between align-middle gap-2">
                  <div className="flex flex-row gap-2 align-middle">
                    <Clipboard className="w-5 h-5" />
                    {report.numeroReporte}
                  </div>
                  <Badge>
                    {report.tipoNovedad
                      .split("_")
                      .map((word) =>
                        word === "DANIO"
                          ? "Daño"
                          : word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(report.fechaRegistro), "PPP", {
                    locale: es,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Tablet className="w-4 h-4" />
                    Tablet {report.tabletId || "N/A"}
                  </p>
                  {report.docente && (
                    <p className="ml-6">Docente: {report.docente}</p>
                  )}
                  {report.salon && (
                    <p className="ml-6">Salón: {report.salon}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Link
                  className="w-full"
                  href={`/v1/reports/mobile-classrooms/${report.id}/viewdetail`}
                >
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-red-700 text-white hover:bg-zinc-900 w-full"
                  >
                    <Eye className="w-4 h-4 mr-1" /> Ver
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        {isLoadingMore && <MobileClassroomsReportSkeleton />}
        {!reports.length && !isLoading && (
          <p>No se encontraron reportes de aulas móviles.</p>
        )}
      </ScrollArea>
    </div>
  );
}

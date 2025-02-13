// src/app/v1/(dashboard)/reports/network/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NetworkReport } from "@/types/network"; // Import type
import useSWRInfinite from "swr/infinite";
import { useCallback, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NetworkReportSkeleton } from "@/components/skeletons/SkeletonsUI"; // Use NetworkReportSkeleton
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
    Clipboard,
    User,
    Calendar,
  } from "lucide-react";


const PAGE_SIZE = 10;

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch network reports");
  }
  return res.json();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
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

  const reports: NetworkReport[] = data
    ? data.reduce((acc, val) => acc.concat(val.reports), [])
    : [];

    const isLoadingMore =
        isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
    const isEmpty = data?.[0]?.reports.length === 0;
    const isReachingEnd =
        isEmpty || (data && data[data.length - 1]?.reports.length < PAGE_SIZE);

  const debouncedSetSize = useCallback((newSize: number) => {
    const handler = debounce((size: number) => {
      setSize(size);
    }, 250); // 250ms debounce delay. Adjust as needed.
    handler(newSize);
  }, [setSize]);

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

  if (error) return <div>Ocurrio un error al obtener los reportes de red.</div>;

  return (
    <div className="p-2">
      <div className="flex justify-end items-center mb-4">
        <Link href="/v1/reports/network/create">
          <Button>Agregar Reporte de Red</Button>
        </Link>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)] w-[100%]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reports.map((report, index) => (
           <Card
              key={report.id}
              ref={index === reports.length - 1 ? lastReportRef : undefined}
              className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg"
            >
              <CardHeader>
                <CardTitle className="flex flex-col align-middle gap-2">
                  <h2 className="text-base font-semibold">
                  Reporte de Red
                  </h2>
                  <div className="flex flex-row gap-2 align-middle">
                    <Clipboard className="w-5 h-5" />
                    {report.numeroReporte}
                  </div>
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
                        <User className="w-4 h-4" />
                        <Badge variant="outline">{report.tecnico || "N/A"}</Badge>
                    </p>
                    <p className="flex items-center gap-2">
                        <span>
                            {report.tipo}
                        </span>
                    </p>
                  <div className="flex items-center gap-2">
                     <Badge variant={report.estado === "RESUELTO" || report.estado === "CERRADO" ? "default": "destructive"}>{report.estado}</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Link href={`/v1/reports/network/${report.id}/viewdetail`}>
                  <Button size="sm" variant="secondary">
                   Ver
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        {isLoadingMore && <NetworkReportSkeleton />}  {/* Corrected Skeleton */}
        {!reports.length && !isLoading && (
          <p>No se encontraron reportes de red.</p>
        )}
      </ScrollArea>
    </div>
  );
}
// src/app/v1/(dashboard)/reports/mobile-classrooms/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import useSWRInfinite from "swr/infinite";
import { useCallback, useRef, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {  Tablet } from "lucide-react";
import { MobileClassroomsReport } from "@/types/mobile-classrooms";
import { MobileClassroomsReportSkeleton } from "@/components/skeletons/SkeletonsUI";
import ReportCard, { ReportCardDetail } from "@/components/ReportCard";  // Import Report Card
import { debounce } from "@/lib/utils";


const PAGE_SIZE = 10;

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch mobile classroom reports");
  }
  return res.json();
};


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
          {reports.map((report, index) => {
            const details: ReportCardDetail[] = [
                {
                    label: "Tablet",
                    value: (
                        <>
                        <Tablet className="w-4 h-4 inline-block mr-1" />
                         {report.tabletId || "N/A"}
                        </>
                    )
                },
                {
                    label: "Docente",
                    value: report.docente || "N/A"
                },
                {
                    label: "Salon",
                    value: report.salon || "N/A"
                }
            ]
            return (
              <ReportCard
                key={report.id}
                title={report.numeroReporte}
                date={report.fechaRegistro}
                badgeText={
                  report.tipoNovedad
                    .split("_")
                    .map((word) =>
                      word === "DANIO"
                        ? "Daño"
                        : word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                    )
                    .join(" ")
                }
                details={details}
                viewDetailHref={`/v1/reports/mobile-classrooms/${report.id}/viewdetail`}
                ref={
                  index === reports.length - 1 ? lastReportRef : undefined
                }
              />
            );
          })}
        </div>
        {isLoadingMore && <MobileClassroomsReportSkeleton />}
        {!reports.length && !isLoading && (
          <p>No se encontraron reportes de aulas móviles.</p>
        )}
      </ScrollArea>
    </div>
  );
}
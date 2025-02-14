// filepath: src/app/v1/(dashboard)/reports/maintenance/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MaintenanceReportSkeleton } from "@/components/skeletons/SkeletonsUI";
import { User } from "lucide-react";
import { MaintenanceReport } from "@/types/maintenance";
import useSWRInfinite from "swr/infinite";
import { useCallback, useRef, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReportCard, { ReportCardDetail } from "@/components/ReportCard"; // Import ReportCard
import { debounce } from "@/lib/utils";


const PAGE_SIZE = 10;

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error("Failed to fetch reports");
    }
    return res.json();
};


export default function MaintenanceReportsPage() {
    const { data, error, size, setSize, isLoading } = useSWRInfinite(
        (pageIndex) =>
            `/api/v1/reports/maintenance?page=${pageIndex + 1}&pageSize=${PAGE_SIZE}`,
        fetcher
    );

    const reports = useMemo(
      () => (data ? data.reduce((acc, val) => acc.concat(val.reports), []) : []),
      [data]
    ) as MaintenanceReport[]; // Type assertion.

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

    if (error) return <div>Ocurrio un error al obtener los reportes.</div>;

    return (
        <div className="p-2">
            <div className="flex justify-end items-center mb-4">
                <Link href="/v1/reports/maintenance/create">
                    <Button>Agregar Reporte</Button>
                </Link>
            </div>

            <ScrollArea className="h-[calc(100vh-280px)] w-[100%]">
                {" "}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {reports.map((report, index) => {
                      const details: ReportCardDetail[] = [ // Corrected type here
                            {
                                label: "Equipo",
                                value: report.equipo,
                            },
                            {
                                label: "Técnico",
                                value: (
                                    <>
                                        <User className="w-4 h-4 inline-block mr-1" />
                                        {report.tecnico.charAt(0).toUpperCase() +
                                            report.tecnico.slice(1).toLowerCase()}
                                    </>
                                ),
                            },
                        ];
                        if (report.modelo) {
                            details.push({ label: "Serial", value: report.modelo });
                        }

                        return (
                            <ReportCard
                                key={report.id}
                                title={report.numeroReporte}
                                date={report.fechaRegistro}
                                subtitle={`Equipo: ${report.equipo}`}
                                details={details}
                                badgeText={
                                    report.tipoMantenimiento.charAt(0).toUpperCase() +
                                    report.tipoMantenimiento.slice(1).toLowerCase()
                                }
                                badgeVariant={
                                    report.tipoMantenimiento === "CORRECTIVO"
                                        ? "destructive"
                                        : "secondary"
                                }
                                viewDetailHref={`/v1/reports/maintenance/${report.id}/viewdetail`}
                                ref={
                                    index === reports.length - 1 ? lastReportRef : undefined
                                }
                            />
                        );
                    })}
                </div>
                {isLoadingMore && <MaintenanceReportSkeleton />}
                {!reports.length && !isLoading && (
                    <p>No se encontraron reportes.</p>
                )}
            </ScrollArea>
        </div>
    );
}
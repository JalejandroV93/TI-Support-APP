// filepath: src/app/v1/(dashboard)/reports/maintenance/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MaintenanceReportSkeleton } from "@/components/skeletons/SkeletonsUI";
import {
  Clipboard,
  PenToolIcon as Tool,
  User,
  Calendar,
  Eye,
} from "lucide-react";
import { MaintenanceReport } from "@/types/maintenance";
import useSWRInfinite from 'swr/infinite';  // Import useSWRInfinite
import { useCallback } from "react";


const PAGE_SIZE = 10;


const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch reports');
    }
    return res.json();
};



export default function MaintenanceReportsPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && !previousPageData.reports.length) return null; // Reached the end
        return `/api/v1/reports/maintenance?page=${pageIndex + 1}&pageSize=${PAGE_SIZE}`; // SWR key
    };

    const { data, error, size, setSize, isLoading } = useSWRInfinite(getKey, fetcher);

    const reports: MaintenanceReport[] = data ? data.reduce((acc, val) => acc.concat(val.reports), []) : [];
    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
    const isEmpty = data?.[0]?.reports.length === 0;
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.reports.length < PAGE_SIZE);


    const loadMore = useCallback(() => {
        if (isLoadingMore || isReachingEnd) return;
        setSize(size + 1);
    }, [isLoadingMore, isReachingEnd, setSize, size]);

    // Observe the last report item.
    const lastReportRef = useCallback(
        (node: HTMLDivElement) => {
        if (isLoadingMore) return;
            if (node) {
                const observer = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting && !isReachingEnd) {
                      loadMore();
                    }
                });
              observer.observe(node);
              return () => observer.disconnect(); // Cleanup on unmount/re-render
            }

        },
        [isLoadingMore, isReachingEnd, loadMore]
      );




  if (error) return <div>Failed to load reports.</div>;


  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Reportes de Mantenimiento</h1>
        <Link href="/v1/reports/maintenance/create">
          <Button>Crear Reporte</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {reports.map((report, index) => (
          <Card
            key={report.id}
            ref={index === reports.length - 1 ? lastReportRef : undefined} // Conditionally set ref
            className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg"
          >

              <CardHeader>
                <CardTitle className="flex flex-col align-middle gap-2">
                  <h2 className="text-base font-semibold">

                    Mantenimiento{" "}
                    {report.tipoMantenimiento
                      .toLowerCase()
                      .charAt(0)
                      .toUpperCase() +
                      report.tipoMantenimiento.toLowerCase().slice(1)}
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
                    <Tool className="w-4 h-4" />
                    {report.equipo}
                  </p>
                  {report.marca && (
                    <p className="ml-6">Marca: {report.marca}</p>
                  )}
                  {report.modelo && (
                    <p className="ml-6">Modelo: {report.modelo}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <Badge variant="outline">{report.tecnico}</Badge>
                  </div>
                </div>
              </CardContent>
            <CardFooter className="flex justify-end">

              <Link href={`/v1/reports/maintenance/${report.id}/viewdetail`}>
                <Button size="sm" variant="secondary">
                  <Eye className="w-4 h-4 mr-1" /> Ver
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
        {isLoadingMore && <MaintenanceReportSkeleton />}
      </div>

      {!reports.length && !isLoading && <p>No se encontraron reportes.</p>}
    </div>
  );
}
// filepath: src/app/v1/(dashboard)/reports/maintenance/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link"; // Import Link
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
import { MaintenanceReport, ReportResponse } from "@/types/maintenance";

export default function MaintenanceReportsPage() {
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [, setTotalCount] = useState(0); // Still useful for knowing the total, even if not displayed directly
  const [loading, setLoading] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastReportRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const pageSize = 10;
    let ignore = false; // Prevent state updates after unmount

    async function fetchReports() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/v1/reports/maintenance?page=${page}&pageSize=${pageSize}`
        );
        if (!res.ok) {
          console.error("Failed to fetch reports:", await res.text());
          return;
        }
        const data: ReportResponse = await res.json();

        if (!ignore) {
          setReports((prevReports) => {
            // This correctly handles avoiding duplicates:
            const existingIds = new Set(prevReports.map((r) => r.id));
            const uniqueNewReports = data.reports.filter(
              (r) => !existingIds.has(r.id)
            );
            return [...prevReports, ...uniqueNewReports];
          });
          setTotalCount(data.totalCount); //  Store the total count.
          setHasMore(
            data.reports.length > 0 &&
              data.page * data.pageSize < data.totalCount
          );
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    }

    if (hasMore) {
      fetchReports();
    }

    return () => {
      ignore = true; // Prevent updates on unmount
    };
  }, [page, hasMore]);

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
            ref={index === reports.length - 1 ? lastReportRef : null}
            className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg"
          >
            {/*  Remove onClick from the Card itself. */}
              <CardHeader>
                <CardTitle className="flex flex-col align-middle gap-2">
                  <h2 className="text-base font-semibold">
                    {" "}
                    {/* Use text-base */}
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
                  {" "}
                  {/* Use text-sm */}
                  <Calendar className="w-4 h-4" />
                  {format(new Date(report.fechaRegistro), "PPP", {
                    locale: es,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 text-sm">
                  {" "}
                  {/* Consistent text size */}
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
                  <p className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <Badge variant="outline">{report.tecnico}</Badge>
                  </p>
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
        {loading && <MaintenanceReportSkeleton />}
      </div>

      {!reports.length && !loading && <p>No se encontraron reportes.</p>}
    </div>
  );
}

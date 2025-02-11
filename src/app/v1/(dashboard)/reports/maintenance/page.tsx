// app/v1/reports/maintenance/page.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';


interface MaintenanceReport {
  id: number;
  numeroReporte: string;
  equipo: string;
  marca?: string;
  modelo?: string;
  diagnostico: string;
  fechaRecibido: string;
  fechaEntrega?: string;
  tecnico: string;
  usuario: { nombre: string }; // Assuming you include user info
}

interface ReportResponse {
    reports: MaintenanceReport[];
    totalCount: number;
    page: number;
    pageSize: number;
}


export default function MaintenanceReportsPage() {
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false); // Track loading state
  const router = useRouter();

  const observer = useRef<IntersectionObserver | null>(null);

    const lastReportRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);



  useEffect(() => {
     const pageSize = 10; // Keep this consistent
     console.log("contador", totalCount);
    async function fetchReports() {
      setLoading(true); // Set loading to true before fetching
      try {
        const res = await fetch(`/api/v1/reports/maintenance?page=${page}&pageSize=${pageSize}`);
        if (!res.ok) {
            //Handle error
            console.error("Failed to fetch reports:", await res.text());
            setLoading(false);
            return
        }
        const data: ReportResponse = await res.json();

        setReports(prevReports => [...prevReports, ...data.reports]);
        setTotalCount(data.totalCount)
        setHasMore(data.reports.length > 0 && (data.page * data.pageSize) < data.totalCount);

      } catch (error) {
        console.error("Error fetching reports:", error);

      } finally{
        setLoading(false); // Set loading to false after fetching
      }
    }
    if(hasMore) {
         fetchReports();
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); // Fetch reports when page changes


   const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este reporte?')) return;
    const res = await fetch(`/api/v1/reports/maintenance/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
        //Optimistically remove the report from the UI
        setReports(prev => prev.filter(report => report.id !== id));

         //Decrement totalCount
         setTotalCount(prevCount => Math.max(0, prevCount -1)) //Avoid negative

    } else {
        //Handle errors
        console.error("Failed to delete report", await res.text());
    }
  };


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Reportes de Mantenimiento</h1>
      <Button onClick={() => router.push('/v1/reports/maintenance/create')}>
        Crear Reporte
      </Button>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {reports.map((report, index) => (
            <Card key={report.id} ref={index === reports.length -1 ? lastReportRef: null}>
                <CardHeader>
                  <CardTitle>{report.numeroReporte}</CardTitle>
                  <CardDescription>Equipo: {report.equipo}</CardDescription>
                   {report.marca && <CardDescription>Marca: {report.marca}</CardDescription>}
                   {report.modelo && <CardDescription>Modelo: {report.modelo}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <p>
                    <Badge variant="outline">Técnico: {report.tecnico}</Badge>
                  </p>
                  <p className="mt-2 text-gray-500">
                    Fecha Recibido: {format(new Date(report.fechaRecibido), "PPP", { locale: es })}
                  </p>
                  {report.fechaEntrega && (
                    <p className="text-gray-500">
                      Fecha Entrega: {format(new Date(report.fechaEntrega), "PPP", { locale: es })}
                    </p>
                  )}

                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button size="sm" variant="outline" onClick={() => router.push(`/v1/reports/maintenance/${report.id}/edit`)}>Editar</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(report.id)}>Eliminar</Button>
                </CardFooter>
            </Card>
        ))}
        {loading && <p>Cargando...</p>}
      </div>
       {!hasMore && reports.length > 0 &&  <p className='text-center mt-4'>No hay más reportes que mostrar.</p>}
       {!reports.length && !loading && <p>No se encontraron reportes.</p>}
    </div>
  );
}
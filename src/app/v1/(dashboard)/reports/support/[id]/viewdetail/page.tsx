// src/app/v1/(dashboard)/reports/support/[id]/viewdetail/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { SupportReport } from "@/types/support"; // Import SupportReport
import {
  Clipboard,
  User,
  Calendar,
  Printer,
  ArrowLeft,
  Edit,
  CheckCircle,
    XCircle
} from "lucide-react";
import { ReportSkeleton } from "@/components/skeletons/SkeletonsUI";
import { use } from "react";
import { useSupportReportStore } from "@/store/supportReportStore"; // Import Zustand store
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { toast } from "sonner"; // Import useToast

interface PageProps {
  params: Promise<{ id: string }>;
}

const ReportDetail = ({ params: paramsPromise }: PageProps) => {
  const [report, setReport] = useState<SupportReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = use(paramsPromise);
  const reportId = params.id;
  const { deleteReport } = useSupportReportStore(); // Use Zustand action

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching report...");
        const res = await fetch(`/api/v1/reports/support/${reportId}`);
        if (res.ok) {
          const data = await res.json();
          setReport(data);
        } else {
          if (res.status === 404) {
            setError("Reporte no encontrado.");
          } else {
            setError(
              `Error al cargar el reporte: ${res.status} - ${res.statusText}`
            );
          }
        }
      } catch (err) {
        toast.error("Error al cargar el reporte");
        console.error("Error al cargar el reporte", err);
        setError(
          "Error al cargar el reporte. Verifica tu conexión a internet."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // Add state for dialog
  const handleDelete = async () => {
    setIsConfirmDialogOpen(true); // Open confirmation dialog
  };

  const handleConfirmDelete = async () => {
    // Separate confirmation handler
    setIsConfirmDialogOpen(false); // Close dialog
    const success = await deleteReport(reportId); // Use Zustand action to delete report

    if (success) {
      router.push("/v1/reports/support"); // Navigate back to list on success
    } else {
      toast.error(
        useSupportReportStore.getState().error ||
          "Error al eliminar el reporte."
      ); // Get error from Zustand
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <ReportSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!report) {
    return <div>No se encontró el reporte.</div>;
  }

    const getStatusLabel = (status: string) => {
        return (
          status.charAt(0).toUpperCase() +
          status.slice(1).toLowerCase().replace("_", " ")
        );
      };
  
  //Helper function to get Status variant
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

    return (
    <div className="p-4 print:p-8 max-w-4xl mx-auto">
      <Card className="print:shadow-none">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <Link href="/v1/reports/support">
              <Button variant="ghost" className="print:hidden">
                <ArrowLeft className="mr-2 h-4 w-4" /> Regresar
              </Button>
            </Link>
            <Badge
              variant={getStatusVariant(report.estado)}
              className="text-md px-4 py-2"
            >
              {getStatusLabel(report.estado)}
            </Badge>
          </div>
          <CardTitle className="flex flex-col gap-2 items-start print:items-center">
            <div className="flex items-center gap-2">
              <Clipboard className="w-5 h-5" /> {/* Reduced size */}
              <h1 className="text-lg font-bold">{report.numeroReporte}</h1>{" "}
              {/* Reduced size */}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {format(new Date(report.fecha), "PPP", { locale: es })}
              </span>
            </div>
          </CardTitle>
          <CardDescription className="flex gap-2 mt-2 text-base">
            {" "}
            {/* Reduced text size */}
            <User className="w-5 h-5 text-muted-foreground" />
            <p className="text-gray-700 dark:text-gray-50">{report.usuario.nombre}</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                <p className="font-medium">Categoría:</p>
                <p>{report.categoria.nombre}</p>
                </div>
                <div>
                <p className="font-medium">Tipo de Usuario:</p>
                <p>{report.tipoUsuario}</p>
                </div>
                <div>
                <p className="font-medium">Área de Reporte:</p>
                <p>{report.area.nombre}</p>  {/* Use area.nombre */}
                </div>
                 <div>
                    <p className="font-medium">Nombre:</p>
                    <p>{report.nombrePersona || "N/A"}</p>
                </div>
                {report.ubicacionDetalle && (
                <div>
                    <p className="font-medium">Ubicación Detallada:</p>
                    <p>{report.ubicacionDetalle}</p>
                </div>
                )}
                <div>
                    <p className="font-medium">Fecha Solución:</p>
                    <p>{report.fechaSolucion ? format(new Date(report.fechaSolucion), "PPP", {
                        locale: es,
                        }) : "N/A"}</p>
                </div>
            </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Descripción</h2>
            <p>{report.descripcion || "Ninguna descripción."}</p>
          </div>
          {/* Solución y Notas Técnicas */}
          {report.solucion && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Solución</h2>
              <p>{report.solucion}</p>
            </div>
          )}
          {report.notas && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Notas</h2>
              <p>{report.notas}</p>
            </div>
          )}

        <div className="mt-4 flex items-center gap-2">
            {report.fueSolucionado ? (
            <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-600 font-medium">
                Solucionado
                </span>
            </>
            ) : (
            <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-600 font-medium">
                No Solucionado
                </span>
            </>
            )}
        </div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-between gap-4 print:hidden">
          <div className="flex gap-2">
            <Link href={`/v1/reports/support/${report.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Editar
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
          <Button className="hidden" variant="secondary" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </CardFooter>
      </Card>
      {/* Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={isConfirmDialogOpen}
        title="Eliminar Reporte"
        description="¿Estás seguro de que quieres eliminar este reporte?  Esta acción es irreversible."
        reportNumber={report ? report.numeroReporte : ""} // Pass the report number
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmDialogOpen(false)} // Close dialog on cancel
      />
    </div>
  );
};

export default ReportDetail;
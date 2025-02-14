// src/app/v1/(dashboard)/reports/mobile-classrooms/[id]/viewdetail/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Clipboard, Edit, Printer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { MobileClassroomsReport } from "@/types/mobile-classrooms";
import { useMobileClassroomsReportStore } from "@/store/mobileClassroomReportStore";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { ReportSkeleton } from "@/components/skeletons/SkeletonsUI";


interface PageProps {
  params: Promise<{ id: string }>;
}

const MobileClassroomReportDetail = ({ params: paramsPromise }: PageProps) => {
  const [report, setReport] = useState<MobileClassroomsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const router = useRouter();
  const params = use(paramsPromise);
  const reportId = params.id;

  const { deleteReport } = useMobileClassroomsReportStore();

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/v1/reports/mobile-classrooms/${reportId}`
        );
        if (res.ok) {
          const data = await res.json();
          setReport(data);
        } else {
          setError(
            res.status === 404
              ? "Reporte de aula móvil no encontrado."
              : `Error al cargar el reporte: ${res.status} - ${res.statusText}`
          );
        }
      } catch (err) {
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

  const handleDelete = () => setIsConfirmDialogOpen(true);

  const handleConfirmDelete = async () => {
    setIsConfirmDialogOpen(false);
    const success = await deleteReport(reportId);
    if (success) {
      router.push("/v1/reports/mobile-classrooms");
    } else {
      toast.error(
        useMobileClassroomsReportStore.getState().error ||
          "Error al eliminar el reporte."
      );
    }
  };

  const handlePrint = () => window.print();

  if (loading) return <ReportSkeleton />;
  if (error)
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  if (!report)
    return (
      <Alert>
        <AlertTitle>No encontrado</AlertTitle>
        <AlertDescription>
          No se encontró el reporte de aula móvil.
        </AlertDescription>
      </Alert>
    );

  return (
    <div className="p-4 print:p-8 max-w-4xl mx-auto">
      <Card className="print:shadow-none">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <Link href="/v1/reports/mobile-classrooms">
              <Button variant="ghost" className="print:hidden">
                <ArrowLeft className="mr-2 h-4 w-4" /> Regresar
              </Button>
            </Link>
            <Badge className="text-md px-4 py-2">Aula Móvil</Badge>
          </div>
          <CardTitle className="flex flex-col gap-2 items-start print:items-center">
            <div className="flex items-center gap-2">
              <Clipboard className="w-5 h-5" />
              <h1 className="text-2xl font-bold">{report.numeroReporte}</h1>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>
                {format(new Date(report.fechaRegistro), "PPP", { locale: es })}
              </span>
            </div>
          </CardTitle>
          <CardDescription className="flex gap-2 mt-2 text-base">
            <p className="text-gray-700 dark:text-gray-300">
              {report.tipoNovedad
                .split("_")
                .map((word) =>
                  word === "DANIO"
                    ? "Daño"
                    : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(" ")}
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <InfoSection
              title="Detalles del Incidente"
              items={[
                {
                  label: "Fecha del Incidente",
                  value: format(new Date(report.fechaIncidente), "PPP", {
                    locale: es,
                  }),
                },
                { label: "Tablet ID", value: report.tabletId || "N/A" },
                { label: "Estudiante", value: report.estudiante || "N/A" },
                {
                  label: "Grado Estudiante",
                  value: report.gradoEstudiante || "N/A",
                },
                // Added this
                { label: "Docente", value: report.docente || "N/A" },
                { label: "Salon", value: report.salon || "N/A" },
              ]}
            />
          </div>
          <Separator className="my-6" />
          <div className="space-y-6">
            <TextSection title="Novedades" content={report.novedades} />
            <TextSection
              title="Observaciones"
              content={report.observaciones ?? ""}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between print:hidden">
          <div className="flex gap-2">
            <Link href={`/v1/reports/mobile-classrooms/${report.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Editar
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
          <Button variant="secondary" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </CardFooter>
      </Card>
      <ConfirmDeleteDialog
        open={isConfirmDialogOpen}
        title="Eliminar Reporte de aula móvil"
        description="¿Estás seguro de que quieres eliminar este reporte? Esta acción es irreversible."
        reportNumber={report.numeroReporte}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </div>
  );
};

const InfoSection = ({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: React.ReactNode }[];
}) => (
  <div>
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex flex-col">
          <span className="text-sm text-muted-foreground">{item.label}</span>
          <span className="font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);

const TextSection = ({
  title,
  content,
}: {
  title: string;
  content: string | null;
}) => (
  <div>
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <p className="text-gray-700 dark:text-gray-300">{content || "N/A"}</p>
  </div>
);

export default MobileClassroomReportDetail;
// filepath: src/app/v1/(dashboard)/reports/maintenance/edit/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link
import MaintenanceForm from "@/components/maintenance/MaintenanceForm";
import { FormState } from "@/types/maintenance";
import { useAuth } from "@/components/providers/AuthProvider";
import { use } from "react";
import { ArrowLeft } from "lucide-react"; // Import ArrowLeft icon
import { Button } from "@/components/ui/button"; // Import Button
import { useMaintenanceReportStore } from "@/store/maintenanceReportStore"; // Import Zustand store
import { ReportSkeleton } from "@/components/skeletons/SkeletonsUI"; // Import Skeleton component
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string }>;
}

const loadingState: FormState = {
  tipoEquipo: "OTRO",
  equipo: "",
  marca: "",
  modelo: "",
  sistemaOp: "",
  procesador: "",
  ram: "",
  ramCantidad: 0,
  tipoMantenimiento: "PREVENTIVO",
  diagnostico: "",
  solucion: "",
  fechaRecibido: "",
  fechaEntrega: "",
  tecnico: "",
  detallesProceso: "",
  observaciones: "",
};

const EditMaintenanceReport = ({ params: paramsPromise }: PageProps) => {
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(loadingState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [, setSubmitError] = useState<string | null>(null); // Keep submit error separate
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingReport, setLoadingReport] = useState(true);
  const router = useRouter();
  const { technicians, fetchTechnicians, updateReport } =
    useMaintenanceReportStore(); // Use Zustand actions and state

  const params = use(paramsPromise);
  const reportId = params.id;

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  useEffect(() => {
    const fetchReport = async () => {
      setLoadingReport(true);
      try {
        const res = await fetch(`/api/v1/reports/maintenance/${reportId}`);
        if (res.ok) {
          const data = await res.json();
          const reportData: FormState = {
            tipoEquipo: data.tipoEquipo,
            equipo: data.equipo,
            marca: data.marca,
            modelo: data.modelo,
            sistemaOp: data.sistemaOp,
            procesador: data.procesador,
            ram: data.ram,
            ramCantidad: data.ramCantidad,
            tipoMantenimiento: data.tipoMantenimiento,
            diagnostico: data.diagnostico,
            solucion: data.solucion,
            fechaRecibido: data.fechaRecibido
              ? new Date(data.fechaRecibido).toISOString()
              : "",
            fechaEntrega: data.fechaEntrega
              ? new Date(data.fechaEntrega).toISOString()
              : "",
            tecnico: data.tecnico,
            detallesProceso: data.detallesProceso,
            observaciones: data.observaciones,
          };

          setForm(reportData);
        } else {
          console.error("Error al obtener el reporte");
          toast.error("Error al obtener el reporte.  Inténtalo de nuevo."); // Use toast
        }
      } catch (error) {
        console.error("Error al obtener el reporte", error);
        toast.error("Error al obtener el reporte. Inténtalo de nuevo."); // Use toast
      } finally {
        setLoadingReport(false);
      }
    };

    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]:
        type === "number"
          ? value === ""
            ? null
            : parseInt(value, 10) // Correctly handle empty string for numbers
          : value,
    }));

    setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  const handleDateChange = (
    name: "fechaRecibido" | "fechaEntrega",
    date: Date | undefined
  ) => {
    if (date) {
      setForm({ ...form, [name]: date.toISOString() });
      setErrors({ ...errors, [name]: undefined });
    } else {
      setForm({ ...form, [name]: "" }); // Empty string for undefined date
    }
  };

  const handleSelectChange = (name: keyof FormState, value: string) => {
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  const validate = (): Partial<Record<keyof FormState, string>> => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.equipo) newErrors.equipo = "Equipo es requerido";
    if (!form.tipoEquipo) newErrors.tipoEquipo = "Tipo de equipo es requerido";
    if (!form.fechaRecibido)
      newErrors.fechaRecibido = "Fecha de recibido es requerida";
    if (!form.tecnico) newErrors.tecnico = "Técnico es requerido";

    if (form.tipoMantenimiento !== "CORRECTIVO") {
      if (!form.detallesProceso)
        newErrors.detallesProceso = "Detalles del proceso son requeridos";
    } else {
      if (!form.diagnostico)
        newErrors.diagnostico =
          "Diagnóstico es requerido para mantenimiento correctivo";
      if (!form.solucion)
        newErrors.solucion =
          "Solución es requerida para mantenimiento correctivo";
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null); // Clear previous submit errors
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    if (!user) {
      toast.error(
        "No se pudo obtener el usuario. Recarga la página e intenta de nuevo."
      );
      setIsSubmitting(false);
      return;
    }

    const success = await updateReport(reportId, form); // Use Zustand action to update report

    if (success) {
      router.push("/v1/reports/maintenance"); //  Use router.push. router.refresh is not strictly needed after navigation
    } else {
      // Use toast for error messages, getting from Zustand if available
      toast.error(
        useMaintenanceReportStore.getState().error ||
          "Error al actualizar el reporte. Inténtalo de nuevo."
      );
    }
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    router.push("/v1/reports/maintenance"); // Use router.push for navigation
  };

  if (loadingReport) {
    return <ReportSkeleton />;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        {" "}
        {/* Container for title and back button */}
        <h1 className="text-2xl font-bold">
          Editar Reporte de Mantenimiento
        </h1>{" "}
        {/* Reduced font size */}
        <Link href="/v1/reports/maintenance">
          <Button
            variant="outline"
            size="sm"
            className="bg-[#be1522] text-white hover:bg-background"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />{" "}
            {/* Added back button with icon */}
            Regresar
          </Button>
        </Link>
      </div>
      {/* Use sonner for displaying errors */}
      {useMaintenanceReportStore.getState().error &&
        toast.error(useMaintenanceReportStore.getState().error)}

      <MaintenanceForm
        form={form}
        errors={errors}
        technicians={technicians}
        handleChange={handleChange}
        handleDateChange={handleDateChange}
        handleSelectChange={handleSelectChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Guardar Cambios"
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EditMaintenanceReport;

// src/app/v1/(dashboard)/reports/network/[id]/edit/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import NetworkForm from "@/components/network/NetworkForm";
import { NetworkReportFormState } from "@/types/network";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNetworkReportStore } from "@/store/networkReportStore";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportSkeleton } from "@/components/skeletons/SkeletonsUI";

interface PageProps {
    params: Promise<{ id: string }>;
}

const loadingState: NetworkReportFormState = {
    fechaIncidente: "",
    ubicacion: "",
    tipo: "OTRO",
    descripcion: "",
    dispositivo: "",
    direccionIP: "",
    direccionMAC: "",
    estado: "ABIERTO",
    prioridad: "BAJA",
    tecnico: "",
    notasTecnicas: "",
    solucion: "",
};

const EditNetworkReport = ({ params: paramsPromise }: PageProps) => {
    const { user } = useAuth();
    const [form, setForm] = useState<NetworkReportFormState>(loadingState);
    const [errors, setErrors] = useState<Partial<Record<keyof NetworkReportFormState, string>>>({});
    const [, setSubmitError] = useState<string | null>(null);  // Separate submit error state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingReport, setLoadingReport] = useState(true);
    const router = useRouter();
    const { technicians, fetchTechnicians, updateReport } = useNetworkReportStore(); // Use Zustand store

    const params = use(paramsPromise);
    const reportId = params.id;

    useEffect(() => {
        fetchTechnicians();
    }, [fetchTechnicians]);

    useEffect(() => {
    const fetchReport = async () => {
      setLoadingReport(true);
      try {
        const res = await fetch(`/api/v1/reports/network/${reportId}`);
        if (res.ok) {
          const data = await res.json();
          const reportData: NetworkReportFormState = {
            fechaIncidente: data.fechaIncidente ? new Date(data.fechaIncidente).toISOString() : "",
            ubicacion: data.ubicacion,
            tipo: data.tipo,
            descripcion: data.descripcion,
            dispositivo: data.dispositivo,
            direccionIP: data.direccionIP,
            direccionMAC: data.direccionMAC,
            estado: data.estado,
            prioridad: data.prioridad,
            tecnico: data.tecnico,
            notasTecnicas: data.notasTecnicas,
            solucion: data.solucion,
          };

          setForm(reportData);
        } else {
          console.error("Error al obtener el reporte");
          toast.error("Error al obtener el reporte. Inténtalo de nuevo.");
        }
      } catch (error) {
        console.error("Error al obtener el reporte", error);
        toast.error("Error al obtener el reporte. Inténtalo de nuevo.");
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
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => { // Corrected type
    if (date) {
      setForm({ ...form, [name]: date.toISOString() });
      setErrors({ ...errors, [name]: undefined });
    } else {
      setForm({ ...form, [name]: "" }); // Empty string for undefined date
    }
  };

  const handleSelectChange = (name: keyof NetworkReportFormState, value: string) => {
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  const validate = (): Partial<Record<keyof NetworkReportFormState, string>> => {
    const newErrors: Partial<Record<keyof NetworkReportFormState, string>> = {};
    if (!form.fechaIncidente) newErrors.fechaIncidente = "Fecha de incidente es requerida";
    if (!form.tipo) newErrors.tipo = "Tipo de incidente es requerido";
    if (!form.prioridad) newErrors.prioridad = "Prioridad es requerida";

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

    const success = await updateReport(reportId, form); // Use Zustand action

    if (success) {
      router.push("/v1/reports/network"); // Navigate on success
    } else {
      // Use toast for error messages
      toast.error(
        useNetworkReportStore.getState().error ||
          "Error al actualizar el reporte. Inténtalo de nuevo."
      ); // Get error from Zustand
    }
    setIsSubmitting(false);
  };

    const handleCancel = () => {
        router.push("/v1/reports/network");
    };
  if (loadingReport) {
    return <ReportSkeleton />;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
       <div className="flex items-center justify-between">

        <h1 className="text-2xl font-bold">
          Editar Reporte de Red
        </h1>
        <Link href="/v1/reports/network">
          <Button
            variant="outline"
            size="sm"
            className="bg-[#be1522] text-white hover:bg-background"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />

            Regresar
          </Button>
        </Link>
      </div>

      {useNetworkReportStore.getState().error && toast.error(useNetworkReportStore.getState().error)}

      <NetworkForm
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

export default EditNetworkReport;
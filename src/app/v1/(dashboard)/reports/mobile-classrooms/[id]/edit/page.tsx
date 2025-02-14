// src/app/v1/(dashboard)/reports/mobile-classrooms/[id]/edit/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import MobileClassroomsForm from "@/components/mobile-classrooms/MobileClassroomsForm";
import { MobileClassroomsReportFormState } from "@/types/mobile-classrooms";
import { useAuth } from "@/components/providers/AuthProvider";
import { useMobileClassroomsReportStore } from "@/store/mobileClassroomReportStore"; // Import Zustand
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportSkeleton } from "@/components/skeletons/SkeletonsUI";

interface PageProps {
  params: Promise<{ id: string }>;
}

const loadingState: MobileClassroomsReportFormState = {
  fechaIncidente: "",
  tabletId: "",
  novedades: "",
  tipoNovedad: "OTRO",
  estudiante: "",
  gradoEstudiante: "",
  observaciones: "",
};

const EditMobileClassroomsReport = ({
  params: paramsPromise,
}: PageProps) => {
  const { user } = useAuth();
  const [form, setForm] =
    useState<MobileClassroomsReportFormState>(loadingState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof MobileClassroomsReportFormState, string>>
  >({});
  const [, setSubmitError] = useState<string | null>(null); // Keep submit error separate
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingReport, setLoadingReport] = useState(true);
  const router = useRouter();
  const { updateReport } = useMobileClassroomsReportStore(); // Use Zustand action

  const params = use(paramsPromise);
  const reportId = params.id;

  useEffect(() => {
    const fetchReport = async () => {
      setLoadingReport(true);
      try {
        const res = await fetch(
          `/api/v1/reports/mobile-classrooms/${reportId}`
        );
        if (res.ok) {
          const data = await res.json();
          const reportData: MobileClassroomsReportFormState = {
            fechaIncidente: data.fechaIncidente
              ? new Date(data.fechaIncidente).toISOString()
              : "",
            tabletId: data.tabletId,
            novedades: data.novedades,
            tipoNovedad: data.tipoNovedad,
            estudiante: data.estudiante,
            gradoEstudiante: data.gradoEstudiante,
            observaciones: data.observaciones,
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

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setForm({ ...form, [name]: date.toISOString() });
      setErrors({ ...errors, [name]: undefined });
    } else {
      setForm({ ...form, [name]: "" });
    }
  };

  const handleSelectChange = (
    name: keyof MobileClassroomsReportFormState,
    value: string
  ) => {
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  const validate = (): Partial<
    Record<keyof MobileClassroomsReportFormState, string>
  > => {
    const newErrors: Partial<
      Record<keyof MobileClassroomsReportFormState, string>
    > = {};
    if (!form.fechaIncidente)
      newErrors.fechaIncidente = "Fecha de incidente es requerida";
    if (!form.novedades) newErrors.novedades = "Novedades es requerido";
    if (!form.tipoNovedad) newErrors.tipoNovedad = "Tipo de novedad es requerido";

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
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

    const success = await updateReport(reportId, form);
    if (success) {
      router.push("/v1/reports/mobile-classrooms");
    } else {
      toast.error(
        useMobileClassroomsReportStore.getState().error ||
          "Error al actualizar el reporte. Inténtalo de nuevo."
      );
    }
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    router.push("/v1/reports/mobile-classrooms");
  };

  if (loadingReport) {
    return <ReportSkeleton />;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar Reporte de Aula Móvil</h1>
        <Link href="/v1/reports/mobile-classrooms">
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

      {useMobileClassroomsReportStore.getState().error &&
        toast.error(useMobileClassroomsReportStore.getState().error)}

      <MobileClassroomsForm
        form={form}
        errors={errors}
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

export default EditMobileClassroomsReport;
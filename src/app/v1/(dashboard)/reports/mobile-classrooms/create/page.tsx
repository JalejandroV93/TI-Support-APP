// src/app/v1/(dashboard)/reports/mobile-classrooms/create/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/components/providers/AuthProvider";
import MobileClassroomsForm from "@/components/mobile-classrooms/MobileClassroomsForm";
import { MobileClassroomsReportFormState } from "@/types/mobile-classrooms";
import { useMobileClassroomsReportStore } from "@/store/mobileClassroomReportStore"; // Import the Zustand store
import { Button } from "@/components/ui/button";
const initialState: MobileClassroomsReportFormState = {
  fechaIncidente: "",
  tabletId: "",
  novedades: "",
  tipoNovedad: "OTRO",
  estudiante: "",
  gradoEstudiante: "",
  observaciones: "",
  docente: "",    // ADDED
  salon: "",     // ADDED
};

const CreateMobileClassroomsReport = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<MobileClassroomsReportFormState>(
    initialState
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof MobileClassroomsReportFormState, string>>
  >({});
  const [, setSubmitError] = useState<string | null>(null); //Keep submit error separete.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { createReport } = useMobileClassroomsReportStore(); // Use Zustand action

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
        setSubmitError(null); //Clear error
        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSubmitting(false);
            return;
        }

        if (!user) {
            setSubmitError("No se pudo obtener el usuario. Recarga la página e intenta de nuevo."); //Use setSubmitError
            setIsSubmitting(false);
            return;
        }


        const success = await createReport(form); // Use Zustand action
        if (success) {
            router.push("/v1/reports/mobile-classrooms");
            router.refresh(); // Consider removing if optimistic updates are sufficient
            setForm(initialState); // Reset form
        } else {
          setSubmitError(useMobileClassroomsReportStore.getState().error || "Error al crear el reporte. Inténtalo de nuevo."); // Get error from Zustand
        }
        setIsSubmitting(false);
    };
    //Add this for the back button
    const handleCancel = () => {
      router.push("/v1/reports/mobile-classrooms"); // Use router.push for navigation
    };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-end items-center">
      {/* Add this for the "Volver" button */}
      <Button
        onClick={() => router.back()}
        className=""
      >
        Volver
      </Button>
      </div>
      {useMobileClassroomsReportStore.getState().error && (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
        {useMobileClassroomsReportStore.getState().error}
        </AlertDescription>
      </Alert>
      )}

      <MobileClassroomsForm
      form={form}
      errors={errors}
      handleChange={handleChange}
      handleDateChange={handleDateChange}
      handleSelectChange={handleSelectChange}
      handleSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitButtonText="Crear Reporte"
      onCancel={handleCancel} // Add the onCancel prop
      />
    </div>
  );
};

export default CreateMobileClassroomsReport;
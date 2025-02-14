// src/app/v1/(dashboard)/reports/support/create/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/components/providers/AuthProvider";
import SupportForm from "@/components/support/SupportForm";
import { SupportReportFormState } from "@/types/support";
import { useSupportReportStore } from "@/store/supportReportStore";
import { Button } from "@/components/ui/button";
import { SoporteEstado, TipoUsuario } from "@prisma/client";


const initialState: SupportReportFormState = {
  categoriaId: 0, // Initialize as 0 or a valid default ID
  reporteAreaId: 0,
  descripcion: "",
  tipoUsuario: TipoUsuario.OTRO,
  nombrePersona: "",
  ubicacionDetalle: "",
  solucion: "",
  notas: "",
  estado: SoporteEstado.ABIERTO,
  fueSolucionado: false,
};

const CreateSupportReportPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<SupportReportFormState>(initialState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof SupportReportFormState, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { createReport } = useSupportReportStore();

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

    const handleSelectChange = (
    name: keyof SupportReportFormState,
    value: string | number | boolean
  ) => {
    // Ensure categoriaId is always a number
    const processedValue =
      name === "categoriaId" || name === "reporteAreaId" ? parseInt(value as string, 10) : value;
    setForm((prevForm) => ({ ...prevForm, [name]: processedValue }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  const validate = (): Partial<
    Record<keyof SupportReportFormState, string>
  > => {
    const newErrors: Partial<Record<keyof SupportReportFormState, string>> = {};
    if (!form.categoriaId) newErrors.categoriaId = "La categoría es requerida";
    if (!form.reporteAreaId)
      newErrors.reporteAreaId = "El area de reporte es requerida";
    if (!form.tipoUsuario) newErrors.tipoUsuario = "El tipo de usuario es requerido";
    if (!form.descripcion) newErrors.descripcion = "La descripción es requerida";

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    if (!user) {
      //toast.error("No se pudo obtener el usuario. Recarga la página e intenta de nuevo."); // Avoid direct toast in handleSubmit
      setIsSubmitting(false);
      return;
    }

    const success = await createReport(form);  //CreateReport now returns a promise
    if (success) {
      router.push("/v1/reports/support");
      router.refresh(); // Consider if you really need to refresh here, if you're doing optimistic updates
      setForm(initialState); // Reset form on success
    }
    //Error handled in zustand store
    setIsSubmitting(false);
  };

    const handleCancel = () => {
        router.push("/v1/reports/support"); // Use router.push for navigation
    };



  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Crear Reporte de Soporte</h1>
        <Button onClick={() => router.back()}>Volver</Button>
      </div>
      {useSupportReportStore.getState().error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {useSupportReportStore.getState().error}
          </AlertDescription>
        </Alert>
      )}
      <SupportForm
        form={form}
        errors={errors}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Crear Reporte"
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateSupportReportPage;
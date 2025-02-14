// src/app/v1/(dashboard)/reports/network/create/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NetworkForm from "@/components/network/NetworkForm";
import { NetworkReportFormState } from "@/types/network";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNetworkReportStore } from "@/store/networkReportStore";
import { toast } from "sonner";

const initialState: NetworkReportFormState = {
    fechaIncidente: "",
    ubicacion: "",
    tipo: "OTRO",
    descripcion: "",
    dispositivo: "",
    estado: "ABIERTO",
    prioridad: "BAJA",
    tecnico: "",
    solucion: "",
    fueSolucionado: false,
};

const CreateNetworkReport = () => {

  const { user } = useAuth();
  const [form, setForm] = useState<NetworkReportFormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof NetworkReportFormState, string>>>({});
  const [, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { technicians, fetchTechnicians, createReport } = useNetworkReportStore();

  useEffect(() => {
      fetchTechnicians();
  }, [fetchTechnicians]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            setForm({ ...form, [name]: "" });
        }
    };

    const handleSelectChange = (name: keyof NetworkReportFormState, value: string | number | boolean) => {
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

    const success = await createReport(form);

    if (success) {
      router.push("/v1/reports/network");
      router.refresh(); // Consider removing if optimistic updates are sufficient
      setForm(initialState); // Reset form
    } else {
       toast.error(
        useNetworkReportStore.getState().error ||
          "Error al crear el reporte. Inténtalo de nuevo."
      ); // Get error from Zustand
    }

    setIsSubmitting(false);
  };
    const handleCancel = () => {
        router.push("/v1/reports/network");
    };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">
        Generar Reporte de Incidente de Red
      </h1>
      {useNetworkReportStore.getState().error && (
        toast.error(useNetworkReportStore.getState().error)
      )}

      <NetworkForm
        form={form}
        errors={errors}
        technicians={technicians}
        handleChange={handleChange}
        handleDateChange={handleDateChange}
        handleSelectChange={handleSelectChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Crear Reporte"
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateNetworkReport;
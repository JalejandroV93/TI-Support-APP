// src/app/v1/(dashboard)/reports/maintenance/create/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/components/providers/AuthProvider";
import MaintenanceForm from "@/components/maintenance/MaintenanceForm";
import { FormState } from "@/types/maintenance";
import { useMaintenanceReportStore } from "@/store/maintenanceReportStore";
import { Button } from "@/components/ui/button";

const initialState: FormState = {
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

const CreateMaintenanceReport = () => {

    const { user } = useAuth();
    const [form, setForm] = useState<FormState>(initialState);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const [, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { technicians, fetchTechnicians, createReport } = useMaintenanceReportStore();
    useEffect(() => {
        fetchTechnicians();
    }, [fetchTechnicians]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            // Handle number inputs, setting to null if empty
            [name]: type === 'number' ? (value === '' ? null : parseInt(value, 10)) : value,
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

    const handleSelectChange = (name: keyof FormState, value: string) => {
        setForm((prevForm) => ({ ...prevForm, [name]: value }));
        setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    };

    const validate = (): Partial<Record<keyof FormState, string>> => {
        const newErrors: Partial<Record<keyof FormState, string>> = {};
        if (!form.equipo) newErrors.equipo = "Equipo es requerido";
        if (!form.tipoEquipo) newErrors.tipoEquipo = "Tipo de equipo es requerido";
        if (!form.fechaRecibido) newErrors.fechaRecibido = "Fecha de recibido es requerida";
        if (!form.tecnico) newErrors.tecnico = "Técnico es requerido";
        if (form.tipoMantenimiento !== "CORRECTIVO") {
            if (!form.detallesProceso) newErrors.detallesProceso = "Detalles del proceso son requeridos";
        } else {
            if (!form.diagnostico) newErrors.diagnostico = "Diagnóstico es requerido para mantenimiento correctivo";
            if (!form.solucion) newErrors.solucion = "Solución es requerida para mantenimiento correctivo";
        }
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
            setSubmitError("No se pudo obtener el usuario. Recarga la página e intenta de nuevo.");
            setIsSubmitting(false);
            return;
        }


        const success = await createReport(form); // Use Zustand action to create report

        if (success) {
            router.push("/v1/reports/maintenance");
            router.refresh(); // Refresh to reflect new data - consider if refresh is needed after optimistic update.
            setForm(initialState); // Reset form after successful submission.
        } else {
            setSubmitError(useMaintenanceReportStore.getState().error || "Error al crear el reporte. Inténtalo de nuevo."); // Get error from Zustand
        }
        setIsSubmitting(false);
    };


    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Generar Reporte de Mantenimiento</h1>
            <Button
                onClick={() => router.back()}
                className=""
            >
                Volver
            </Button>
            </div>
            {useMaintenanceReportStore.getState().error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{useMaintenanceReportStore.getState().error}</AlertDescription>
            </Alert>
            )}

            <MaintenanceForm
            form={form}
            errors={errors}
            technicians={technicians}
            handleChange={handleChange}
            handleDateChange={handleDateChange}
            handleSelectChange={handleSelectChange}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Crear Reporte"
            />
        </div>
    );
};

export default CreateMaintenanceReport;
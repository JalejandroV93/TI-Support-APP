// filepath: src/app/v1/(dashboard)/reports/maintenance/create/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/components/providers/AuthProvider"; // Import useAuth
import MaintenanceForm from "@/components/maintenance/MaintenanceForm";
import { FormState, Technician } from "@/types/maintenance";


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
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                const res = await fetch("/api/v1/users/technicians");
                if (res.ok) {
                    const data = await res.json();
                    setTechnicians(data);
                } else {
                    console.error("Error al obtener técnicos");
                }
            } catch (error) {
                console.error("Error al obtener técnicos", error);
            }
        };
        fetchTechnicians();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: type === "number" ? parseInt(value) || 0 : value,
        }));
        setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    };

    const handleDateChange = (name: "fechaRecibido" | "fechaEntrega", date: Date | undefined) => {
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

        // const payload: FormState & { userId: string } = {  // Use intersection type
        //     ...form,
        //     userId: user.id,
        // };

        const res = await fetch("/api/v1/reports/maintenance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            router.push("/v1/reports/maintenance");
            router.refresh();
            setForm(initialState); // Reset form after successful submission.
        } else {
            const errorData = await res.json();
            setSubmitError(errorData.error || "Error al crear el reporte. Inténtalo de nuevo.");
        }
        setIsSubmitting(false);
    };



    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold">Generar Reporte de Mantenimiento</h1>
            {submitError && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{submitError}</AlertDescription>
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
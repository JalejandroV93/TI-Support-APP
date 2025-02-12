// filepath: src/app/v1/(dashboard)/reports/maintenance/edit/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import MaintenanceForm from "@/components/maintenance/MaintenanceForm";
import { FormState, Technician } from "@/types/maintenance";
import { useAuth } from "@/components/providers/AuthProvider";
import { use } from "react";
import { ArrowLeft } from "lucide-react"; // Import ArrowLeft icon
import { Button } from "@/components/ui/button"; // Import Button


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
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loadingReport, setLoadingReport] = useState(true);
    const router = useRouter();

    const params = use(paramsPromise);
      const reportId = params.id;

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



    useEffect(() => {
        const fetchReport = async () => {
            setLoadingReport(true);
            try {
                const res = await fetch(`/api/v1/reports/maintenance/${reportId}`);
                if (res.ok) {
                    const data = await res.json();
                    const reportData: FormState = {
                        ...data,
                        fechaRecibido: data.fechaRecibido ? new Date(data.fechaRecibido).toISOString() : "",
                        fechaEntrega: data.fechaEntrega ? new Date(data.fechaEntrega).toISOString() : "",
                    };

                    setForm(reportData);
                } else {
                    console.error("Error al obtener el reporte");
                    setSubmitError("Error al obtener el reporte.  Inténtalo de nuevo.");
                }
            } catch (error) {
                console.error("Error al obtener el reporte", error);
                setSubmitError("Error al obtener el reporte. Inténtalo de nuevo.");
            } finally {
                setLoadingReport(false);
            }
        };

        if (reportId) {
            fetchReport();
        }
    }, [reportId]);



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

        const payload = {
            ...form,
            userId: user.id,
          };

        const res = await fetch(`/api/v1/reports/maintenance/${reportId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            router.push("/v1/reports/maintenance");  //  Use router.push. router.refresh is not strictly needed after navigation
        } else {
            const errorData = await res.json();
            setSubmitError(errorData.error || "Error al actualizar el reporte. Inténtalo de nuevo.");
        }
        setIsSubmitting(false);
    };

    const handleCancel = () => {
        router.push("/v1/reports/maintenance"); // Use router.push for navigation
    };

    if (loadingReport) {
        return <div>Cargando reporte...</div>;
    }


    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between"> {/* Container for title and back button */}
                <h1 className="text-2xl font-bold">Editar Reporte de Mantenimiento</h1> {/* Reduced font size */}
                <Link href="/v1/reports/maintenance">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> {/* Added back button with icon */}
                        Regresar
                    </Button>
                </Link>
            </div>
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
                submitButtonText="Guardar Cambios"
                onCancel={handleCancel}
            />
        </div>
    );
};

export default EditMaintenanceReport;
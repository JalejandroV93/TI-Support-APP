// src/app/v1/(dashboard)/reports/support/[id]/edit/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import SupportForm from "@/components/support/SupportForm"; //IMPORT
import { SupportReportFormState } from "@/types/support";  //IMPORT
import { useAuth } from "@/components/providers/AuthProvider";
import { useSupportReportStore } from "@/store/supportReportStore"; // Import Zustand
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReportSkeleton } from "@/components/skeletons/SkeletonsUI"; //IMPORT
import { prisma } from "@/lib/prisma";  //IMPORT

interface PageProps {
  params: Promise<{ id: string }>;
}

const loadingState: SupportReportFormState = {
    categoriaId: 0,
    descripcion: "",
    fecha: "",
  };

const EditSupportReportPage = ({ params: paramsPromise }: PageProps) => {
    const { user } = useAuth();
    const [form, setForm] = useState<SupportReportFormState>(loadingState);
    const [errors, setErrors] = useState<
      Partial<Record<keyof SupportReportFormState, string>>
    >({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingReport, setLoadingReport] = useState(true);
    const router = useRouter();
    const { updateReport, fetchTechnicians, technicians } = useSupportReportStore();  //Add fetchTechnicians and technicians.

    const [categories, setCategories] = useState<{ id: number; nombre: string }[]>([]);

    const params = use(paramsPromise);
    const reportId = params.id;

    useEffect(() => {
        fetchTechnicians();
    }, [fetchTechnicians]);

    useEffect(() => {
        const fetchCategories = async () => {
          const categories = await prisma.soporteCategoria.findMany({
            select: { id: true, nombre: true },
          });
          setCategories(categories);
        };
    
        fetchCategories();
      }, []);
  
    useEffect(() => {
      const fetchReport = async () => {
        setLoadingReport(true);
        try {
          const res = await fetch(`/api/v1/reports/support/${reportId}`);
          if (res.ok) {
            const data = await res.json();
            const reportData: SupportReportFormState = {
                categoriaId: data.categoriaId,
                descripcion: data.descripcion,
                fecha: data.fecha
                ? new Date(data.fecha).toISOString()
                : "",
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
  
    const handleSelectChange = (
      name: keyof SupportReportFormState,
      value: string | number
    ) => {
      // Ensure categoriaId is always a number
      const processedValue = name === "categoriaId" ? parseInt(value as string, 10) : value;
      setForm((prevForm) => ({ ...prevForm, [name]: processedValue }));
      setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    };
  
    const validate = (): Partial<
      Record<keyof SupportReportFormState, string>
    > => {
      const newErrors: Partial<
        Record<keyof SupportReportFormState, string>
      > = {};
      if (!form.categoriaId)
        newErrors.categoriaId = "La categoría es requerida";
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
        toast.error(
          "No se pudo obtener el usuario. Recarga la página e intenta de nuevo."
        );
        setIsSubmitting(false);
        return;
      }
  
      const success = await updateReport(reportId, form);
      if (success) {
        router.push("/v1/reports/support");
      } else {
        toast.error(
          useSupportReportStore.getState().error ||
            "Error al actualizar el reporte. Inténtalo de nuevo."
        );      }
      setIsSubmitting(false);
    };
  
    
  
    if (loadingReport) {
      return <ReportSkeleton />;
    }
  
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Editar Reporte de Soporte
        </h1>
        <Link href="/v1/reports/support">
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
  
        {useSupportReportStore.getState().error &&
          toast.error(useSupportReportStore.getState().error)}
  
        <SupportForm
          form={form}
          errors={errors}
          technicians={technicians}
          handleChange={handleChange}
          handleDateChange={handleDateChange}
          handleSelectChange={handleSelectChange}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          categories={categories}  // Pass categories here
        />
      </div>
    );
  };

export default EditSupportReportPage;
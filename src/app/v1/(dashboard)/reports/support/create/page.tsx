// src/app/v1/(dashboard)/reports/support/create/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupportReportStore } from "@/store/supportReportStore";
import { SupportReportFormState } from "@/types/support";
import SupportForm from "@/components/support/SupportForm";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/components/providers/AuthProvider";
import {  SoporteEstado, TipoUsuario } from "@prisma/client";

const initialState: SupportReportFormState = {
  categoriaId: 0, // Initialize as 0 or a valid default ID
  reporteAreaId: 0,
  descripcion: "",
  //fecha: "",
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

    const [categories, setCategories] = useState<
      { id: number; nombre: string }[]
    >([]);

    //NEW: Report Areas
    const [areas, setAreas] = useState<{ id: number; nombre: string }[]>([]);

    useEffect(() => {
          // --- Fetch Categories (using your API route) ---
      const fetchCategories = async () => {
        try {
          const res = await fetch("/api/v1/reports/support-categories"); // New route!
          if (res.ok) {
            const categoriesData = await res.json();
            setCategories(categoriesData); // Assuming the API returns an array of { id, nombre }
          } else {
            console.error("Failed to fetch categories:", await res.text());
            // Consider showing an error to the user.
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
          // Consider showing an error to the user.
        }
      };

      //NEW Fetch Areas
      const fetchAreas = async () => {
        try {
          const res = await fetch("/api/v1/settings/areas"); // NEW ROUTE!
          if (res.ok) {
            const areasData = await res.json();
            setAreas(areasData); // Assuming the API returns an array of { id, nombre }
          } else {
            console.error("Failed to fetch areas:", await res.text());
          }
        } catch (error) {
          console.error("Error fetching areas:", error);
        }
      };

      fetchCategories();
      fetchAreas();
    }, []);

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

    // Remove handleDateChange

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
        // toast.error("No se pudo obtener el usuario. Recarga la página e intenta de nuevo."); // Avoid direct toast in handleSubmit
        setIsSubmitting(false);
        return;
      }
  
      const success = await createReport(form);
      if (success) {
        router.push("/v1/reports/support");
        router.refresh(); // Consider if you really need to refresh here, if you're doing optimistic updates
        setForm(initialState); // Reset form
      } else {
        // toast.error("Error al crear el reporte. Inténtalo de nuevo.");  // Avoid direct toast
      }
  
      setIsSubmitting(false);
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
          categories={categories} // Pass categories here
          areas={areas} // Pass areas
        />
      </div>
    );
  };
  
  export default CreateSupportReportPage;
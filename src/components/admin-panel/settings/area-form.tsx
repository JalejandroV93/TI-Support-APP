// src/components/admin-panel/settings/area-form.tsx
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useReportAreaStore } from "@/store/reportAreaStore"; // Import Store
import { toast } from "sonner";

// Define the form schema
const areaSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(255),
  descripcion: z.string().optional(),
});

type AreaFormValues = z.infer<typeof areaSchema>;

interface AreaFormProps {
  area?: { id: number; nombre: string; descripcion: string | null };
  onClose: () => void;
  onSuccess: () => void;
}

export const AreaForm: React.FC<AreaFormProps> = ({
  area,
  onClose,
  onSuccess,
}) => {
  const { createArea, updateArea } = useReportAreaStore(); // Use store

  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      nombre: area?.nombre || "",
      descripcion: area?.descripcion || "",
    },
  });

  async function onSubmit(data: AreaFormValues) {
    try {
      let success = false;

      if (area) {
        // Update existing area
        success = await updateArea(area.id, data); // Use store action
      } else {
        // Create new area
        success = await createArea(data); // Use store action
      }

      if (success) {
        toast.success(
          area
            ? "Área actualizada correctamente"
            : "Área creada correctamente"
        );
        onSuccess(); // Refresh list
        onClose();
      } else {
        toast.error("Error al guardar el área");
      }
    } catch (error) {
      console.error("Error submitting form", error);
      toast.error("Error al guardar el área");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del área" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción del área (opcional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{area ? "Guardar" : "Crear"}</Button>
      </form>
    </Form>
  );
};
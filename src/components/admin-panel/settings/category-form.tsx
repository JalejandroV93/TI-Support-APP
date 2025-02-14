// src/components/admin-panel/category-form.tsx
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
import { useCategoryStore } from "@/store/categoryStore";
import { toast } from "sonner";

// Define the form schema
const categorySchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(255),
  descripcion: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: { id: number; nombre: string; descripcion: string | null };
  onClose: () => void;
  onSuccess: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onClose,
  onSuccess,
}) => {
  const { createCategory, updateCategory } = useCategoryStore();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nombre: category?.nombre || "",
      descripcion: category?.descripcion || "",
    },
  });

  async function onSubmit(data: CategoryFormValues) {
    try {
      let success = false;

      if (category) {
        // Update existing category
        success = await updateCategory(category.id, data);
      } else {
        // Create new category
        success = await createCategory(data);
      }

      if (success) {
        toast.success(
          category
            ? "Categoría actualizada correctamente"
            : "Categoría creada correctamente"
        );
        onSuccess(); // Refresh list
        onClose();
      } else {
        toast.error("Error al guardar la categoría");
      }
    } catch (error) {
      console.error("Error submitting form", error);
      toast.error("Error al guardar la categoría");
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
                <Input placeholder="Nombre de la categoría" {...field} />
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
                  placeholder="Descripción de la categoría (opcional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{category ? "Guardar" : "Crear"}</Button>
      </form>
    </Form>
  );
};
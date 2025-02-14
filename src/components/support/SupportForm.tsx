// src/components/support/SupportForm.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SupportReportFormState } from "@/types/support";

interface SupportFormProps {
  form: SupportReportFormState;
  errors: Partial<Record<keyof SupportReportFormState, string>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSelectChange: (
    name: keyof SupportReportFormState,
    value: string | number
  ) => void; // Keep as string | number
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  categories: { id: number; nombre: string }[]; // Expect categories
}

const SupportForm: React.FC<SupportFormProps> = ({
  form,
  errors,
  handleChange,
  handleSelectChange,
  handleSubmit,
  isSubmitting,
  categories,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="categoriaId">Categoría *</Label>
        <Select
            onValueChange={(value) => handleSelectChange("categoriaId", parseInt(value, 10))} // Parse to number here!
            value={form.categoriaId.toString()} // Convert to string for the Select component
          >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoriaId && (
          <p className="text-red-500 text-sm">{errors.categoriaId}</p>
        )}
      </div>
      <div>
        <Label htmlFor="descripcion">Descripción *</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          required
        />
        {errors.descripcion && (
          <p className="text-red-500 text-sm">{errors.descripcion}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creando..." : "Crear Reporte"}
      </Button>
    </form>
  );
};

export default SupportForm;
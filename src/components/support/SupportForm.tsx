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
import { useEffect, useState } from "react";
import { ReporteArea, TipoUsuario } from "@prisma/client";

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

    // --- State for Select Options ---
    const [tipoUsuarioOptions, setTipoUsuarioOptions] = useState<string[]>([]);
    const [reporteAreaOptions, setReporteAreaOptions] = useState<string[]>([]);

    // --- Load enum values on component mount ---
    useEffect(() => {
      // Dynamically get enum values
      setTipoUsuarioOptions(Object.values(TipoUsuario));
      setReporteAreaOptions(Object.values(ReporteArea));
    }, []);
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

      {/* Tipo de Usuario (Select) */}
      <div className="col-span-full md:col-span-1">
          <Label htmlFor="tipoUsuario">Tipo de Usuario *</Label>
          <Select
            onValueChange={(value) => handleSelectChange("tipoUsuario", value)}
            value={form.tipoUsuario} // Asegúrate de que el valor coincida con los valores del enum
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              {tipoUsuarioOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Area de Reporte (Select) */}
        <div className="col-span-full md:col-span-1">
            <Label htmlFor="reporteArea">Area de Reporte *</Label>
            <Select
              onValueChange={(value) => handleSelectChange("reporteArea", value)}
              value={form.reporteArea}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                {reporteAreaOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        
        {/* Solución (Textarea) */}
      <div className="space-y-2">
        <Label htmlFor="solucion">Solución</Label>
        <Textarea
          id="solucion"
          name="solucion"
          value={form.solucion || ""}
          onChange={handleChange}
        />
        {errors.solucion && (
          <p className="text-red-500 text-sm">{errors.solucion}</p>
        )}
      </div>

      {/* Notas Técnicas (Textarea) */}
      <div className="space-y-2">
        <Label htmlFor="notasTecnicas">Notas Técnicas</Label>
        <Textarea
          id="notasTecnicas"
          name="notasTecnicas"
          value={form.notasTecnicas || ""}
          onChange={handleChange}
        />
        {errors.notasTecnicas && (
          <p className="text-red-500 text-sm">{errors.notasTecnicas}</p>
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
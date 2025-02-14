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
import { useEffect, useState, useCallback, useMemo } from "react"; // Import useMemo
import { TipoUsuario } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useReportAreaStore } from "@/store/reportAreaStore"; // Import the area store
import { useCategoryStore } from "@/store/categoryStore"; // Import the category store
import { AreasLoading } from "@/components/skeletons/SkeletonsUI";

interface SupportFormProps {
  form: SupportReportFormState;
  errors: Partial<Record<keyof SupportReportFormState, string>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSelectChange: (
    name: keyof SupportReportFormState,
    value: string | number | boolean
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  submitButtonText: string;
  onCancel?: () => void;
}

const SupportForm: React.FC<SupportFormProps> = ({
  form,
  errors,
  handleChange,
  handleSelectChange,
  handleSubmit,
  isSubmitting,
  submitButtonText,
  onCancel,
}) => {
  const tipoUsuarioOptions = useMemo(() => Object.values(TipoUsuario), []); // UseMemo
  const [showSolution, setShowSolution] = useState(form.fueSolucionado);

  const { areas, loading: areasLoading, fetchAreas } = useReportAreaStore();
  const {
    categories,
    loading: categoriesLoading,
    fetchCategories,
  } = useCategoryStore();

  // Use useCallback to memoize the fetch functions
  const memoizedFetchCategories = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  const memoizedFetchAreas = useCallback(() => {
    fetchAreas();
  }, [fetchAreas]);

  useEffect(() => {
    // Fetch both categories and areas when the component mounts
    memoizedFetchCategories();
    memoizedFetchAreas();
  }, [memoizedFetchCategories, memoizedFetchAreas]); // Depend on memoized functions

  useEffect(() => {
    setShowSolution(form.fueSolucionado);
  }, [form.fueSolucionado]);

  if (areasLoading || categoriesLoading) {
    return <AreasLoading />;
  }

  return (
    <div className="rounded-lg bg-background p-6 shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Categoría */}
        <div>
          <Label htmlFor="categoriaId">Categoría *</Label>
          {/* Conditional Rendering and Loading State */}
          {categories !== null ? (
            <Select
              onValueChange={(value) =>
                handleSelectChange("categoriaId", parseInt(value, 10))
              }
              value={form.categoriaId ? form.categoriaId.toString() : ""}
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
          ) : (
            <p>Cargando categorías...</p> // Or a <Skeleton /> component
          )}
          {errors.categoriaId && (
            <p className="text-red-500 text-sm">{errors.categoriaId}</p>
          )}
        </div>

        {/* Tipo de Usuario (Select) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tipoUsuario">Tipo de Usuario *</Label>
            <Select
              onValueChange={(value) =>
                handleSelectChange("tipoUsuario", value)
              }
              value={form.tipoUsuario}
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
            {errors.tipoUsuario && (
              <p className="text-red-500 text-sm">{errors.tipoUsuario}</p>
            )}
          </div>

          {/* Nombre de la Persona */}
          <div>
            <Label htmlFor="nombrePersona">Nombre de la Persona</Label>
            <Input
              id="nombrePersona"
              name="nombrePersona"
              value={form.nombrePersona || ""}
              onChange={handleChange}
              placeholder="Nombre de la persona"
            />
            {errors.nombrePersona && (
              <p className="text-red-500 text-sm">{errors.nombrePersona}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Area de Reporte (Select) */}
          <div>
            <Label htmlFor="reporteAreaId">Area de Reporte *</Label>
            {/* Conditional Rendering and Loading State */}
            {areas !== null ? (
              <Select
                onValueChange={(value) =>
                  handleSelectChange("reporteAreaId", parseInt(value, 10))
                }
                value={form.reporteAreaId ? form.reporteAreaId.toString() : ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p>Cargando áreas...</p> // Or your Skeleton component.
            )}
            {errors.reporteAreaId && (
              <p className="text-red-500 text-sm">{errors.reporteAreaId}</p>
            )}
          </div>

          {/* Ubicación Detalle (Input) */}
          <div>
            <Label htmlFor="ubicacionDetalle">
              Ubicación Detallada (Opcional)
            </Label>
            <Input
              id="ubicacionDetalle"
              name="ubicacionDetalle"
              value={form.ubicacionDetalle || ""}
              onChange={handleChange}
              placeholder="Ej: Salón 101, Edificio A"
            />
            {errors.ubicacionDetalle && (
              <p className="text-red-500 text-sm">{errors.ubicacionDetalle}</p>
            )}
          </div>
        </div>

        {/* Descripción (Textarea) */}
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
        <div className="flex items-center gap-4">
          <Label htmlFor="fueSolucionado">¿Fue Solucionado?</Label>
          <Switch
            checked={form.fueSolucionado}
            onCheckedChange={(checked) => {
              handleSelectChange("fueSolucionado", checked); //Now it accepts boolean
              setShowSolution(checked); // Control visibility
            }}
            id="fueSolucionado"
          />
        </div>

        {/* Solución (Textarea) - Conditional Rendering */}
        {showSolution && (
          <div>
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
        )}

        {/* Notas (Textarea) */}
        <div>
          <Label htmlFor="notas">Notas</Label>
          <Textarea
            id="notas"
            name="notas"
            value={form.notas || ""}
            onChange={handleChange}
          />
          {errors.notas && (
            <p className="text-red-500 text-sm">{errors.notas}</p>
          )}
        </div>
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {submitButtonText}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SupportForm;

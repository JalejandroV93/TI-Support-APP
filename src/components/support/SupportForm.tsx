
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
import { TipoUsuario } from "@prisma/client";
import { Input } from "@/components/ui/input"; 
import { Switch } from "@/components/ui/switch";
import { useReportAreaStore } from "@/store/reportAreaStore"; 
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
  categories: { id: number; nombre: string }[]; 
  areas: { id: number; nombre: string }[]; 
}

const SupportForm: React.FC<SupportFormProps> = ({
  form,
  errors,
  handleChange,
  handleSelectChange,
  handleSubmit,
  isSubmitting,
  categories,
  areas,  
}) => {
  const [tipoUsuarioOptions, setTipoUsuarioOptions] = useState<string[]>([]);
  const [showSolution, setShowSolution] = useState(form.fueSolucionado); 
  const { loading: areasLoading } = useReportAreaStore();  


  useEffect(() => {
    setTipoUsuarioOptions(Object.values(TipoUsuario));
    setShowSolution(form.fueSolucionado); 
  }, [form.fueSolucionado]);

    
    if (areasLoading) {
        return (
         <AreasLoading />
        );
     }


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Categoría */}
      <div>
        <Label htmlFor="categoriaId">Categoría *</Label>
        <Select
          onValueChange={(value) =>
            handleSelectChange("categoriaId", parseInt(value, 10))
          } 
          value={form.categoriaId.toString()} 
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipoUsuario">Tipo de Usuario *</Label>
          <Select
            onValueChange={(value) => handleSelectChange("tipoUsuario", value)}
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
          <Select
            onValueChange={(value) =>
              handleSelectChange("reporteAreaId", parseInt(value, 10))
            } 
            value={form.reporteAreaId.toString()} 
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              {areas.map(
                (
                  area 
                ) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.nombre}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
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
            handleSelectChange("fueSolucionado", checked);
            setShowSolution(checked);
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
        {errors.notas && <p className="text-red-500 text-sm">{errors.notas}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creando..." : "Crear Reporte"}
      </Button>
    </form>
  );
};

export default SupportForm;
// src/components/network/NetworkForm.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DatePickerField from "@/components/maintenance/DatePickerField";
import TechnicianSelect from "@/components/maintenance/TechnicianSelect";
import { NetworkReportFormState } from "@/types/network"; // Import
import { Technician } from "@/types/global";  // Import from global
import { Switch } from "@/components/ui/switch"; // Import Switch
import { useEffect, useState } from "react";

interface NetworkFormProps {
  form: NetworkReportFormState;
  errors: Partial<Record<keyof NetworkReportFormState, string>>;
  technicians: Technician[];
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleDateChange: (name: string, date: Date | undefined) => void; // Corrected
  handleSelectChange: (
    name: keyof NetworkReportFormState,
    value: string
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText: string;
  onCancel?: () => void;
}

const NetworkForm: React.FC<NetworkFormProps> = ({
  form,
  errors,
  technicians,
  handleChange,
  handleDateChange,
  handleSelectChange,
  handleSubmit,
  isSubmitting,
  submitButtonText,
  onCancel,
}) => {

    const [showSolution, setShowSolution] = useState(form.fueSolucionado); // Control solution field visibility

    useEffect(() => {
        setShowSolution(form.fueSolucionado); //If in edit mode, get data of solved
    }, [form.fueSolucionado]);

  return (
      <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información General del Incidente</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePickerField
            name="fechaIncidente"
            label="Fecha del Incidente *"
            value={form.fechaIncidente}
            onChange={handleDateChange}
            required
            error={errors.fechaIncidente}
          />
          <div className="space-y-2">
            <Label htmlFor="ubicacion">Ubicación *</Label>
            <Input id="ubicacion" name="ubicacion" value={form.ubicacion || ""} onChange={handleChange} required />
            {errors.ubicacion && <p className="text-red-500 text-sm">{errors.ubicacion}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Incidente</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Incidente *</Label>
            <Select onValueChange={(value) => handleSelectChange("tipo", value)} value={form.tipo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DANIO">Daño</SelectItem>
                <SelectItem value="CAMBIO">Cambio</SelectItem>
                <SelectItem value="REPARACION">Reparación</SelectItem>
                <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
                <SelectItem value="OTRO">Otro</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && <p className="text-red-500 text-sm">{errors.tipo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dispositivo">Dispositivo *</Label>
            <Input
              id="dispositivo"
              name="dispositivo"
              value={form.dispositivo || ""}
              onChange={handleChange}
              required
            />
            {errors.dispositivo && <p className="text-red-500 text-sm">{errors.dispositivo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="prioridad">Prioridad *</Label>
            <Select onValueChange={(value) => handleSelectChange("prioridad", value)} value={form.prioridad}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un nivel de prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BAJA">Baja</SelectItem>
                <SelectItem value="MEDIA">Media</SelectItem>
                <SelectItem value="ALTA">Alta</SelectItem>
                <SelectItem value="URGENTE">Urgente</SelectItem>
              </SelectContent>
            </Select>
            {errors.prioridad && <p className="text-red-500 text-sm">{errors.prioridad}</p>}
          </div>

          <TechnicianSelect
            technicians={technicians}
            value={form.tecnico || ""}
            onChange={(value) => handleSelectChange("tecnico", value)}
            error={errors.tecnico}
          />

          <div className="space-y-2 col-span-full">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion || ""}
              onChange={handleChange}
              rows={4}
            />
            {errors.descripcion && <p className="text-red-500 text-sm">{errors.descripcion}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Solución</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
        <div className="flex items-center gap-4">
            <Label htmlFor="fueSolucionado">¿Fue Solucionado?</Label>
            <Switch
              checked={form.fueSolucionado}
              onCheckedChange={(checked) => {
                handleSelectChange("fueSolucionado", checked.toString());
                setShowSolution(checked);  // Control visibility
              }}
            />
            </div>

            {/* Solución (Textarea) - Conditional Rendering */}
          {showSolution && (
          <div className="space-y-2">
            <Label htmlFor="solucion">¿Como se soluciono el incidente?</Label>
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
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {submitButtonText}
        </Button>
        {onCancel && (
              <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
                  Cancelar
              </Button>
          )}
      </div>
    </form>
  );
};

export default NetworkForm;
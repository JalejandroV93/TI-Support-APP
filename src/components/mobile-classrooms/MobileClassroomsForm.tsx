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
import type { MobileClassroomsReportFormState } from "@/types/mobile-classrooms";
import { TipoNovedad } from "@prisma/client";
import type React from "react"; // Added import for React

interface MobileClassroomsFormProps {
  form: MobileClassroomsReportFormState;
  errors: Partial<Record<keyof MobileClassroomsReportFormState, string>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleDateChange: (name: string, date: Date | undefined) => void;
  handleSelectChange: (
    name: keyof MobileClassroomsReportFormState,
    value: string
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText: string;
  onCancel?: () => void;
}

const MobileClassroomsForm: React.FC<MobileClassroomsFormProps> = ({
  form,
  errors,
  handleChange,
  handleDateChange,
  handleSelectChange,
  handleSubmit,
  isSubmitting,
  submitButtonText,
  onCancel,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Incidente</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePickerField
            name="fechaIncidente"
            label="Fecha del Incidente"
            value={form.fechaIncidente}
            onChange={handleDateChange}
            required
            error={errors.fechaIncidente}
          />
          <div className="space-y-2">
            <Label htmlFor="tabletId">ID de la Tablet *</Label>
            <Input
              id="tabletId"
              name="tabletId"
              value={form.tabletId || ""}
              onChange={handleChange}
            />
            {errors.tabletId && (
              <p className="text-red-500 text-sm">{errors.tabletId}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Incidente</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipoNovedad">Tipo de Novedad *</Label>
            <Select
              onValueChange={(value) =>
                handleSelectChange("tipoNovedad", value)
              }
              value={form.tipoNovedad}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TipoNovedad).map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo
                      .split("_")
                      .map((word) =>
                        word === "DANIO"
                          ? "Daño"
                          : word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tipoNovedad && (
              <p className="text-red-500 text-sm">{errors.tipoNovedad}</p>
            )}
          </div>
          <div className="space-y-2 col-span-full">
            <Label htmlFor="novedades">Observación *</Label>
            <Textarea
              id="novedades"
              name="novedades"
              value={form.novedades}
              onChange={handleChange}
              required
              rows={4}
            />
            {errors.novedades && (
              <p className="text-red-500 text-sm">{errors.novedades}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información del Estudiante y Docente</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estudiante">Estudiante</Label>
            <Input
              id="estudiante"
              name="estudiante"
              value={form.estudiante || ""}
              onChange={handleChange}
            />
            {errors.estudiante && (
              <p className="text-red-500 text-sm">{errors.estudiante}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gradoEstudiante">Grado del Estudiante</Label>
            <Input
              id="gradoEstudiante"
              name="gradoEstudiante"
              value={form.gradoEstudiante || ""}
              onChange={handleChange}
            />
            {errors.gradoEstudiante && (
              <p className="text-red-500 text-sm">{errors.gradoEstudiante}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="docente">Docente</Label>
            <Input
              id="docente"
              name="docente"
              value={form.docente || ""}
              onChange={handleChange}
            />
            {errors.docente && (
              <p className="text-red-500 text-sm">{errors.docente}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="salon">Salón</Label>
            <Input
              id="salon"
              name="salon"
              value={form.salon || ""}
              onChange={handleChange}
            />
            {errors.salon && (
              <p className="text-red-500 text-sm">{errors.salon}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observaciones Adicionales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              id="observaciones"
              name="observaciones"
              value={form.observaciones || ""}
              onChange={handleChange}
              rows={4}
            />
            {errors.observaciones && (
              <p className="text-red-500 text-sm">{errors.observaciones}</p>
            )}
          </div>
        </CardContent>
      </Card>

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
  );
};

export default MobileClassroomsForm;

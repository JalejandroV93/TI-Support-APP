// src/components/mobile-classrooms/MobileClassroomsForm.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DatePickerField from "@/components/maintenance/DatePickerField";
import { MobileClassroomsReportFormState } from "@/types/mobile-classrooms";
import { TipoNovedad } from "@prisma/client";

interface MobileClassroomsFormProps {
    form: MobileClassroomsReportFormState;
    errors: Partial<Record<keyof MobileClassroomsReportFormState, string>>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDateChange: (name: string, date: Date | undefined) => void;
    handleSelectChange: (name: keyof MobileClassroomsReportFormState, value: string) => void;
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
    onCancel
}) => {
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Información del Reporte</CardTitle>
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
                        <Label htmlFor="tabletId">ID de la Tablet (Opcional)</Label>
                        <Input
                            id="tabletId"
                            name="tabletId"
                            value={form.tabletId || ""}
                            onChange={handleChange}
                        />
                        {errors.tabletId && <p className="text-red-500 text-sm">{errors.tabletId}</p>}
                    </div>

                    <div className="space-y-2 col-span-full">
                        <Label htmlFor="novedades">Novedades *</Label>
                        <Textarea
                            id="novedades"
                            name="novedades"
                            value={form.novedades}
                            onChange={handleChange}
                            required
                        />
                        {errors.novedades && <p className="text-red-500 text-sm">{errors.novedades}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tipoNovedad">Tipo de Novedad *</Label>
                        <Select
                            onValueChange={(value) => handleSelectChange("tipoNovedad", value)}
                            value={form.tipoNovedad}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(TipoNovedad).map((tipo) => (
                                    <SelectItem key={tipo} value={tipo}>
                                        {/* Display user-friendly names for enum values */}
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
                        {errors.tipoNovedad && <p className="text-red-500 text-sm">{errors.tipoNovedad}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="estudiante">Estudiante (Opcional)</Label>
                        <Input
                            id="estudiante"
                            name="estudiante"
                            value={form.estudiante || ""}
                            onChange={handleChange}
                        />
                        {errors.estudiante && <p className="text-red-500 text-sm">{errors.estudiante}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gradoEstudiante">Grado del Estudiante (Opcional)</Label>
                        <Input
                            id="gradoEstudiante"
                            name="gradoEstudiante"
                            value={form.gradoEstudiante || ""}
                            onChange={handleChange}
                        />
                        {errors.gradoEstudiante && <p className="text-red-500 text-sm">{errors.gradoEstudiante}</p>}
                    </div>

                    {/* Docente (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="docente">Docente (Opcional)</Label>
                        <Input
                            id="docente"
                            name="docente"
                            value={form.docente || ""}
                            onChange={handleChange}
                        />
                        {errors.docente && <p className="text-red-500 text-sm">{errors.docente}</p>}
                    </div>

                    {/* Salón (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="salon">Salón (Opcional)</Label>
                        <Input
                            id="salon"
                            name="salon"
                            value={form.salon || ""}
                            onChange={handleChange}
                        />
                        {errors.salon && <p className="text-red-500 text-sm">{errors.salon}</p>}
                    </div>

                    <div className="space-y-2 col-span-full">
                        <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
                        <Textarea
                            id="observaciones"
                            name="observaciones"
                            value={form.observaciones || ""}
                            onChange={handleChange}
                        />
                        {errors.observaciones && <p className="text-red-500 text-sm">{errors.observaciones}</p>}
                    </div>

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

export default MobileClassroomsForm;
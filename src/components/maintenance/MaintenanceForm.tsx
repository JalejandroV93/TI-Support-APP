// src/components/maintenance/MaintenanceForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePickerField from "./DatePickerField"; // Import the corrected DatePickerField
import EquipoDetailsFields from "./EquipoDetailsFields";
import ProcesoDetailsFields from "./ProcesoDetailsFields";
import { FormState } from "@/types/maintenance";
import { Technician } from "@/types/global"; // Import Technician from global
import TechnicianSelect from "./TechnicianSelect";


interface MaintenanceFormProps {
    form: FormState;
    errors: Partial<Record<keyof FormState, string>>;
    technicians: Technician[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDateChange: (name: string, date: Date | undefined) => void;  // Corrected type
    handleSelectChange: (name: keyof FormState, value: string) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>; // Make handleSubmit async
    isSubmitting: boolean;
    submitButtonText: string;
    onCancel?: () => void; // Optional cancel handler

}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
    form,
    errors,
    technicians,
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
                    <CardTitle>Información General</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <DatePickerField
                        name="fechaRecibido"  // Use string literal
                        label="Fecha Recibido"
                        value={form.fechaRecibido}
                        onChange={handleDateChange} // Pass the function directly
                        required
                        error={errors.fechaRecibido}
                    />
                    <DatePickerField
                        name="fechaEntrega"  // Use string literal
                        label="Fecha Entrega"
                        value={form.fechaEntrega || ""}  // Handle possible null/undefined
                        onChange={handleDateChange}
                        error={errors.fechaEntrega}
                    />
                     <TechnicianSelect
                        technicians={technicians}
                        value={form.tecnico}
                        onChange={(value) => handleSelectChange("tecnico", value)}
                        error={errors.tecnico}
                    />
                    <div className="space-y-2">
                        <Label htmlFor="tipoMantenimiento">Tipo de Mantenimiento *</Label>
                        <Select
                            onValueChange={(value) => handleSelectChange("tipoMantenimiento", value)}
                            value={form.tipoMantenimiento}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona el tipo de mantenimiento" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PREVENTIVO">Preventivo</SelectItem>
                                <SelectItem value="CORRECTIVO">Correctivo</SelectItem>
                                <SelectItem value="OTRO">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.tipoMantenimiento && <p className="text-red-500 text-sm">{errors.tipoMantenimiento}</p>}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Detalles del Equipo</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <EquipoDetailsFields
                        form={form}
                        errors={errors}
                        handleChange={handleChange}
                        handleSelectChange={handleSelectChange}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Detalles del Proceso</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <ProcesoDetailsFields
                        form={form}
                        errors={errors}
                        handleChange={handleChange}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Observaciones Adicionales</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Textarea id="observaciones" name="observaciones" value={form.observaciones || ''} onChange={handleChange} />
                    </div>
                </CardContent>
            </Card>
            <div className="flex gap-4">

                <Button type="submit" className="w-full" disabled={isSubmitting}>
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

export default MaintenanceForm;
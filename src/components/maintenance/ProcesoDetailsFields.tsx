// filepath: src/app/v1/(dashboard)/reports/maintenance/components/ProcesoDetailsFields.tsx
"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormState } from "@/types/maintenance";

interface ProcesoDetailsFieldsProps {
    form: FormState;
    errors: Partial<Record<keyof FormState, string>>;
    handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}
const ProcesoDetailsFields: React.FC<ProcesoDetailsFieldsProps> = ({ form, errors, handleChange }) => {
    return (
        <>
            {form.tipoMantenimiento !== "CORRECTIVO" && (
                <div className="space-y-2">
                    <Textarea
                        id="detallesProceso"
                        name="detallesProceso"
                        value={form.detallesProceso ?? ''}
                        onChange={handleChange}
                        required
                    />
                    {errors.detallesProceso && <p className="text-red-500 text-sm">{errors.detallesProceso}</p>}
                </div>
            )}

            {form.tipoMantenimiento === "CORRECTIVO" && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="diagnostico">Diagnóstico *</Label>
                        <Textarea
                            id="diagnostico"
                            name="diagnostico"
                            value={form.diagnostico ?? ''}
                            onChange={handleChange}
                            required
                        />
                        {errors.diagnostico && <p className="text-red-500 text-sm">{errors.diagnostico}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="solucion">Solución *</Label>
                        <Textarea
                            id="solucion"
                            name="solucion"
                            value={form.solucion ?? ''}
                            onChange={handleChange}
                            required
                        />
                        {errors.solucion && <p className="text-red-500 text-sm">{errors.solucion}</p>}
                    </div>
                </>
            )}
        </>
    )
}

export default ProcesoDetailsFields;
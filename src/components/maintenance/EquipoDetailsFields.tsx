// filepath: src/app/v1/(dashboard)/reports/maintenance/components/EquipoDetailsFields.tsx
"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormState, marcasComunes, sistemasOperativos, tiposRam } from "@/types/maintenance";

interface EquipoDetailsFieldsProps {
    form: FormState;
    errors: Partial<Record<keyof FormState, string>>;
    handleSelectChange: (name: keyof FormState, value: string) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EquipoDetailsFields: React.FC<EquipoDetailsFieldsProps> = ({ form, errors, handleSelectChange, handleChange }) => (
    <>
        <div className="space-y-2">
            <Label htmlFor="equipo">Equipo *</Label>
            <Input id="equipo" name="equipo" value={form.equipo} onChange={handleChange} required />
            {errors.equipo && <p className="text-red-500 text-sm">{errors.equipo}</p>}
        </div>
        {/* Selección de Tipo de Equipo */}
        <div className="space-y-2">
            <Label htmlFor="tipoEquipo">Tipo de Equipo *</Label>
            <Select
                onValueChange={(value) => handleSelectChange("tipoEquipo", value)}
                value={form.tipoEquipo}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de equipo" />
                </SelectTrigger>
                <SelectContent>
                    {["ESCRITORIO", "PORTATIL", "TABLET", "OTRO"].map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                            {tipo}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {errors.tipoEquipo && <p className="text-red-500 text-sm">{errors.tipoEquipo}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="marca">Marca del equipo</Label>
            <Select onValueChange={(value) => handleSelectChange("marca", value)} value={form.marca || ""}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecciona una marca" />
                </SelectTrigger>
                <SelectContent>
                    {marcasComunes.map((marca) => (
                        <SelectItem key={marca} value={marca}>
                            {marca}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="modelo">Modelo del equipo</Label>
            <Input id="modelo" name="modelo" value={form.modelo} onChange={handleChange} />
        </div>

        {/* Renderizamos campos de computadora solo si el tipo de equipo es Escritorio, Portátil o Tablet */}
        {["ESCRITORIO", "PORTATIL", "TABLET"].includes(form.tipoEquipo) && (
            <>
                <div className="space-y-2">
                    <Label htmlFor="sistemaOp">Sistema Operativo</Label>
                    <Select onValueChange={(value) => handleSelectChange("sistemaOp", value)} value={form.sistemaOp || ""}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un SO" />
                        </SelectTrigger>
                        <SelectContent>
                            {sistemasOperativos.map((so) => (
                                <SelectItem key={so} value={so}>
                                    {so}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="procesador">Procesador</Label>
                    <Input id="procesador" name="procesador" value={form.procesador} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ram">Tipo de RAM</Label>
                    <Select onValueChange={(value) => handleSelectChange("ram", value)} value={form.ram || ""}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona tipo de RAM" />
                        </SelectTrigger>
                        <SelectContent>
                            {tiposRam.map((ram) => (
                                <SelectItem key={ram} value={ram}>
                                    {ram}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ramCantidad">Cantidad de RAM (GB)</Label>
                    <Input
                        id="ramCantidad"
                        name="ramCantidad"
                        type="number"
                        value={form.ramCantidad === 0 ? "" : form.ramCantidad}
                        onChange={handleChange}
                        placeholder="Ej: 8"
                    />
                </div>
            </>
        )}
    </>
);

export default EquipoDetailsFields;
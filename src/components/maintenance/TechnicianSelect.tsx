// filepath: /D:/Personales/Python_Projects/TI-Support-APP/src/app/v1/(dashboard)/reports/maintenance/components/TechnicianSelect.tsx
"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Technician } from "@/types/global";

interface TechnicianSelectProps {
    technicians: Technician[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
}
const TechnicianSelect: React.FC<TechnicianSelectProps> = ({ technicians, value, onChange, error }) => {
    return (
        <div className="space-y-2">
            <Label htmlFor="tecnico">Técnico responsable *</Label>
            <Select onValueChange={onChange} value={value}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecciona un técnico" />
                </SelectTrigger>
                <SelectContent>
                    {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.nombre}>
                            {tech.nombre}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
};

export default TechnicianSelect;
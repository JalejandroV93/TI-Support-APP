// filepath: src/app/v1/(dashboard)/reports/maintenance/components/DatePickerField.tsx
"use client";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { DatePickerFieldProps } from "@/types/maintenance";

const DatePickerField: React.FC<DatePickerFieldProps> = ({ name, label, value, onChange, required = false, error }) => (
    <div className="space-y-2">
        <Label htmlFor={name}>
            {label} {required && "*"}
        </Label>
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(new Date(value), "PPP") : <span>Selecciona una fecha</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value ? new Date(value) : undefined}
                    onSelect={(date) => onChange(name, date)}
                />
            </PopoverContent>
        </Popover>
        {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
);

export default DatePickerField;
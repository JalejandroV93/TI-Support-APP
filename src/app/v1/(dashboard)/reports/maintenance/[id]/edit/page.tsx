'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface FormState {
  equipo: string;
  marca?: string;
  modelo?: string;
  sistemaOp?: string;
  procesador?: string;
  ram?: string;
  ramCantidad?: string; // Added ramCantidad
  diagnostico: string;
  falla?: string;
  causa?: string;
  solucion?: string;
  fechaRecibido: string;
  fechaEntrega?: string;
  tecnico: string;
  observaciones?: string;
  detallesProceso?: string;
}

const marcasComunes = ["Dell", "Lenovo", "HP", "Apple", "Asus", "Acer", "Microsoft", "MSI", "Samsung", "Otro"];
const sistemasOperativos = ["Windows 11", "Windows 10", "Windows 7", "macOS", "Linux", "Android", "Otro"];
const tiposRam = ["DDR3", "DDR4", "DDR5", "Otro"];


export default function EditMaintenanceReport() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    equipo: '',
    marca: '',
    modelo: '',
    sistemaOp: '',
    procesador: '',
    ram: '',
    ramCantidad: '', // Initialized ramCantidad
    diagnostico: '',
    falla: '',
    causa: '',
    solucion: '',
    fechaRecibido: '',
    fechaEntrega: '',
    tecnico: '',
    observaciones: '',
    detallesProceso: ''
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      async function fetchReport() {
        const res = await fetch(`/api/v1/reports/maintenance/${id}`);
        if (res.ok) {
          const data = await res.json();
           // Handle null/undefined values properly
          setForm({
            equipo: data.equipo ?? '',
            marca: data.marca ?? '',
            modelo: data.modelo ?? '',
            sistemaOp: data.sistemaOp ?? '',
            procesador: data.procesador ?? '',
            ram: data.ram ?? '',
            ramCantidad: data.ramCantidad ?? '',
            diagnostico: data.diagnostico ?? '',
            falla: data.falla ?? '',
            causa: data.causa ?? '',
            solucion: data.solucion ?? '',
            fechaRecibido: data.fechaRecibido ?? '',
            fechaEntrega: data.fechaEntrega ?? '',
            tecnico: data.tecnico ?? '',
            observaciones: data.observaciones ?? '',
            detallesProceso: data.detallesProceso ?? ''
          });
        } else {
          // Handle fetch error (e.g., report not found)
          setSubmitError('Error al cargar el reporte. Por favor, inténtalo de nuevo.');
        }
      }
      fetchReport();
    }
  }, [id]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleDateChange = (name: 'fechaRecibido' | 'fechaEntrega', date: Date | undefined) => {
    if (date) {
      setForm({ ...form, [name]: date.toISOString() });
      setErrors({ ...errors, [name]: undefined });
    } else {
      setForm({ ...form, [name]: '' }); // Handle clearing the date
    }
  };
  const handleSelectChange = (name: keyof FormState, value: string) => {
      setForm((prevForm) => ({ ...prevForm, [name]: value }));
      setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };


  const validate = (): Partial<FormState> => {
    const newErrors: Partial<FormState> = {};
    if (!form.equipo) newErrors.equipo = 'Equipo es requerido';
    if (!form.diagnostico) newErrors.diagnostico = 'Diagnóstico es requerido';
    if (!form.fechaRecibido) newErrors.fechaRecibido = 'Fecha de recibido es requerida';
    if (!form.tecnico) newErrors.tecnico = 'Técnico es requerido';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    if (!id) {
      setIsSubmitting(false);
      return; // Prevent submission if ID is missing
    }

    const res = await fetch(`/api/v1/reports/maintenance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push('/v1/reports/maintenance');
      router.refresh(); // Ensure the list updates
    } else {
      const errorData = await res.json();
      setSubmitError(errorData.error || 'Error al actualizar el reporte. Por favor, inténtalo de nuevo.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Reporte de Mantenimiento</h1>
      {submitError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fechaRecibido">Fecha Recibido *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.fechaRecibido && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.fechaRecibido ? format(new Date(form.fechaRecibido), "PPP") : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.fechaRecibido ? new Date(form.fechaRecibido) : undefined}
                  onSelect={(date) => handleDateChange('fechaRecibido', date)}

                />
              </PopoverContent>
            </Popover>
            {errors.fechaRecibido && <p className="text-red-500 text-sm">{errors.fechaRecibido}</p>}
          </div>

          <div>
            <Label htmlFor="fechaEntrega">Fecha Entrega</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.fechaEntrega && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.fechaEntrega ? format(new Date(form.fechaEntrega), "PPP") : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.fechaEntrega ? new Date(form.fechaEntrega) : undefined}
                  onSelect={(date) => handleDateChange('fechaEntrega', date)}

                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="equipo">Equipo *</Label>
            <Input id="equipo" name="equipo" value={form.equipo} onChange={handleChange} required />
            {errors.equipo && <p className="text-red-500 text-sm">{errors.equipo}</p>}
          </div>

          <div>
            <Label htmlFor="marca">Marca del equipo</Label>
            <Select onValueChange={(value) => handleSelectChange('marca', value)} value={form.marca}>
                <SelectTrigger className="w-full">
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

          <div>
            <Label htmlFor="modelo">Modelo del equipo</Label>
            <Input id="modelo" name="modelo" value={form.modelo} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="sistemaOp">Sistema Operativo</Label>
             <Select onValueChange={(value) => handleSelectChange('sistemaOp', value)} value={form.sistemaOp}>
                <SelectTrigger className="w-full">
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

          <div>
            <Label htmlFor="procesador">Procesador</Label>
            <Input id="procesador" name="procesador" value={form.procesador} onChange={handleChange} />
          </div>

           <div>
              <Label htmlFor="ram">Tipo de RAM</Label>
              <Select onValueChange={(value) => handleSelectChange('ram', value)} value={form.ram}>
                <SelectTrigger className="w-full">
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
            <div>
              <Label htmlFor="ramCantidad">Cantidad de RAM (GB)</Label>
              <Input
                id="ramCantidad"
                name="ramCantidad"
                type="number"
                value={form.ramCantidad}
                onChange={handleChange}
                placeholder="Ej: 8"
              />
           </div>

          <div>
            <Label htmlFor="diagnostico">Diagnóstico *</Label>
            <Textarea id="diagnostico" name="diagnostico" value={form.diagnostico} onChange={handleChange} required />
            {errors.diagnostico && <p className="text-red-500 text-sm">{errors.diagnostico}</p>}
          </div>

          <div>
            <Label htmlFor="falla">Falla detectada</Label>
            <Textarea id="falla" name="falla" value={form.falla} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="causa">Causa raíz</Label>
            <Textarea id="causa" name="causa" value={form.causa} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="solucion">Solución aplicada</Label>
            <Textarea id="solucion" name="solucion" value={form.solucion} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="tecnico">Técnico responsable *</Label>
            <Input id="tecnico" name="tecnico" value={form.tecnico} onChange={handleChange} required />
            {errors.tecnico && <p className="text-red-500 text-sm">{errors.tecnico}</p>}
          </div>

          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea id="observaciones" name="observaciones" value={form.observaciones} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="detallesProceso">Detalles del Proceso</Label>
            <Textarea id="detallesProceso" name="detallesProceso" value={form.detallesProceso} onChange={handleChange} />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Actualizando...' : 'Actualizar Reporte'}
        </Button>
      </form>
    </div>
  );
}
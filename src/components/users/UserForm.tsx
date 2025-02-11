"use client";
import { Usuario, Rol } from "@prisma/client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  UserIcon,
  MailIcon,
  LockIcon,
  PhoneIcon,
  UserCircleIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface UserFormProps {
  user: Usuario | null;
  onClose: () => void;
  onSuccess: () => void; // Callback para refrescar la data en el padre
}

// Esquemas de validación
const createUserSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  rol: z.nativeEnum(Rol),
  phonenumber: z.string().optional(),
});
const updateUserSchema = z.object({
  username: z.string().min(2),
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().optional(), // La contraseña es opcional en edición
  rol: z.nativeEnum(Rol),
  phonenumber: z.string().optional(),
});

type UserFormValues = {
  username: string;
  nombre: string;
  email: string;
  password?: string;
  rol: Rol;
  phonenumber?: string;
};

export const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSuccess }) => {
  const { toast } = useToast();

  const formSchema = user ? updateUserSchema : createUserSchema;
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username || "",
      nombre: user?.nombre || "",
      email: user?.email || "",
      password: "",
      rol: user?.rol || "COLABORADOR",
      phonenumber: user?.phonenumber || "",
    },
  });

  async function onSubmit(data: UserFormValues) {
    const url = user ? `/api/v1/users?id=${user.id}` : "/api/v1/users";
    const method = user ? "PUT" : "POST";

    if (user && !data.password) {
      delete data.password;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: user
            ? "Usuario actualizado correctamente."
            : "Usuario creado correctamente.",
        });
        onSuccess(); // Notificamos al padre para actualizar la tabla
        onClose();
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.error || "Ocurrió un error inesperado.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error inesperado.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-4xl mx-auto">
        <Card>
          <CardHeader className="hidden">
            <CardTitle>{user ? "Editar Usuario" : "Crear Nuevo Usuario"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de Usuario</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserIcon
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <Input className="pl-10" placeholder="Nombre de usuario" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserCircleIcon
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <Input className="pl-10" placeholder="Nombre completo" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MailIcon
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <Input className="pl-10" placeholder="Correo electrónico" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña {user ? "(Opcional)" : ""}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LockIcon
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <Input
                            className="pl-10"
                            type="password"
                            placeholder="Contraseña"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="rol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ADMIN">Administrador</SelectItem>
                          <SelectItem value="COLABORADOR">Colaborador</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phonenumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Teléfono (Opcional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <PhoneIcon
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <Input className="pl-10" placeholder="Número de teléfono" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{user ? "Guardar Cambios" : "Crear Usuario"}</Button>
        </div>
      </form>
    </Form>
  );
};

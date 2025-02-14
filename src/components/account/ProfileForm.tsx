/**
 * Componente para actualizar los datos básicos del perfil.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserPayload } from "@/types/user";


export const ProfileForm = ({
    user,
    refetchUser,
  }: {
    user: UserPayload | null;
    refetchUser: () => void;
  }) => {
    const [userData, setUserData] = useState<UserPayload | null>(user);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();
  
    useEffect(() => {
      setUserData(user);
    }, [user]);
  
    const handleUpdateProfile = async () => {
      setIsSaving(true);
      try {
        if (!userData) {
          toast.error("No hay datos de usuario.");
          return;
        }
        if (!userData.nombre || !userData.email) {
          toast.error("Nombre y correo electrónico son obligatorios.");
          return;
        }
  
        const response = await fetch("/api/v1/users/account/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: userData.nombre,
            email: userData.email,
            phonenumber: userData.phonenumber,
          }),
        });
  
        if (response.ok) {
          toast.success("Perfil actualizado correctamente.");
          await refetchUser();
          router.refresh();
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Error al actualizar el perfil.");
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast.error(error.message || "Error al actualizar el perfil.");
      } finally {
        setIsSaving(false);
      }
    };
    //console.log("userData", userData);
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Información de {userData?.nombre ? userData.nombre.charAt(0).toUpperCase() + userData.nombre.slice(1).toLowerCase() : "Usuario"}</CardTitle>
          <CardDescription>Actualiza tu información personal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={userData?.nombre || ""}
                onChange={(e) =>
                  setUserData((prev) =>
                    prev ? { ...prev, nombre: e.target.value } : prev
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={userData?.email || ""}
                onChange={(e) =>
                  setUserData((prev) =>
                    prev ? { ...prev, email: e.target.value } : prev
                  )
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phonenumber">Teléfono</Label>
              <Input
                id="phonenumber"
                type="text"
                value={userData?.phonenumber || ""}
                onChange={(e) =>
                  setUserData((prev) =>
                    prev ? { ...prev, phonenumber: e.target.value } : prev
                  )
                }
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpdateProfile} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
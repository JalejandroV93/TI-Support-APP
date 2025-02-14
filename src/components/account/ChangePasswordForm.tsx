import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
import { Eye, EyeOff } from "lucide-react";

export const ChangePasswordForm = ({
  refetchUser,
}: {
  refetchUser: () => void;
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Estados para alternar la visibilidad de cada input
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { toast } = useToast();

  const handlePasswordChange = async () => {
    // Validaciones previas
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast({
        description: "Todos los campos de contraseña son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        description: "Las contraseñas nuevas no coinciden.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        description: "La nueva contraseña debe tener al menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/v1/users/account/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        toast({
          description: "Contraseña actualizada correctamente.",
          variant: "default",
        });
        // Limpiar campos tras el éxito
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        await refetchUser();
      } else {
        const errorData = await response.json();
        toast({
          description: errorData.error || "Error al cambiar la contraseña.",
          variant: "destructive",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error al cambiar la contraseña:", error);
      toast({
        description: error.message || "Error al cambiar la contraseña.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambiar Contraseña</CardTitle>
        <CardDescription>Actualiza tu contraseña actual.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campo: Contraseña Actual */}
        <div className="grid gap-2">
          <Label htmlFor="current-password">Contraseña Actual</Label>
          <div className="relative">
            <Input
              id="current-password"
              name="current-password"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Ingrese su contraseña actual"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
              <span className="sr-only">
                {showCurrentPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"}
              </span>
            </Button>
          </div>
        </div>

        {/* Campo: Nueva Contraseña */}
        <div className="grid gap-2">
          <Label htmlFor="new-password">Nueva Contraseña</Label>
          <div className="relative">
            <Input
              id="new-password"
              name="new-password"
              type={showNewPassword ? "text" : "password"}
              placeholder="Ingrese su nueva contraseña"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowNewPassword((prev) => !prev)}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
              <span className="sr-only">
                {showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              </span>
            </Button>
          </div>
        </div>

        {/* Campo: Confirmar Nueva Contraseña */}
        <div className="grid gap-2">
          <Label htmlFor="confirm-new-password">
            Confirmar Nueva Contraseña
          </Label>
          <div className="relative">
            <Input
              id="confirm-new-password"
              name="confirm-new-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirme su nueva contraseña"
              required
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
              <span className="sr-only">
                {showConfirmPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"}
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
      <Button
          onClick={handlePasswordChange}
          disabled={
            isSaving ||
            (!currentPassword && !newPassword && !confirmNewPassword)
          }
        >
          {isSaving ? "Guardando..." : "Cambiar Contraseña"}
        </Button>
      </CardFooter>
    </Card>
  );
};

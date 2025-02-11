// app/dashboard/users/components/UserActions.tsx
"use client";
import { Usuario } from "@prisma/client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type ConfirmAction = "disable" | "enable" | "unlock" | null;

interface UserActionsProps {
  user: Usuario;
  onEdit: (user: Usuario) => void;
  onRefetch: () => void;
}

export const UserActions: React.FC<UserActionsProps> = ({ user, onEdit, onRefetch }) => {
  const { toast } = useToast();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const handleDisable = async () => {
    try {
      const response = await fetch(`/api/v1/users?id=${user.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast({ title: "Éxito", description: "Usuario desactivado correctamente." });
        onRefetch();
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.error,
        });
      }
    } catch (error) {
      console.error("Error disabling user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error inesperado al desactivar el usuario.",
      });
    }
  };

  const handleEnable = async () => {
    try {
      const response = await fetch(`/api/v1/users/enable?id=${user.id}`, {
        method: "PATCH",
      });
      if (response.ok) {
        toast({ title: "Éxito", description: "Usuario habilitado correctamente." });
        onRefetch();
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.error,
        });
      }
    } catch (error) {
      console.error("Error enabling user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error inesperado al habilitar el usuario.",
      });
    }
  };

  const handleUnlock = async () => {
    try {
      const response = await fetch(`/api/v1/users?id=${user.id}`, {
        method: "PATCH",
      });
      if (response.ok) {
        toast({ title: "Éxito", description: "Usuario desbloqueado." });
        onRefetch();
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.error,
        });
      }
    } catch (error) {
      console.error("Error unlocking user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error inesperado al desbloquear el usuario.",
      });
    }
  };

  const handleConfirmAction = async () => {
    if (confirmAction === "disable") {
      await handleDisable();
    } else if (confirmAction === "enable") {
      await handleEnable();
    } else if (confirmAction === "unlock") {
      await handleUnlock();
    }
    setConfirmAction(null);
  };

  // Configuramos título y descripción para el ConfirmDialog según la acción a confirmar.
  const getDialogTitle = () => {
    if (confirmAction === "disable") return "Desactivar Usuario";
    if (confirmAction === "enable") return "Habilitar Usuario";
    if (confirmAction === "unlock") return "Desbloquear Usuario";
    return "";
  };

  const getDialogDescription = () => {
    if (confirmAction === "disable")
      return "¿Estás seguro de que deseas desactivar este usuario?";
    if (confirmAction === "enable")
      return "¿Estás seguro de que deseas habilitar este usuario?";
    if (confirmAction === "unlock")
      return "¿Estás seguro de que deseas desbloquear a este usuario?";
    return "";
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => onEdit(user)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {user.isDisabled ? (
            <DropdownMenuItem
              className="text-green-500"
              onSelect={(e) => {
                e.preventDefault();
                setConfirmAction("enable");
              }}
            >
              Habilitar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-red-500"
              onSelect={(e) => {
                e.preventDefault();
                setConfirmAction("disable");
              }}
            >
              Desactivar
            </DropdownMenuItem>
          )}
          {user.isBlocked && (
            <DropdownMenuItem
              className="text-green-500"
              onSelect={(e) => {
                e.preventDefault();
                setConfirmAction("unlock");
              }}
            >
              Desbloquear
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {confirmAction && (
        <ConfirmDialog
          open={true}
          title={getDialogTitle()}
          description={getDialogDescription()}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </>
  );
};

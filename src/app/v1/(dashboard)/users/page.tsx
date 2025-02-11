// app/v1/(dashboard)/users/page.tsx
"use client";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { UserTable } from "@/components/users/UserTable";
import { UserForm } from "@/components/users/UserForm";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Usuario } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const UsersPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [refresh, setRefresh] = useState(false);

  const handleEdit = (user: Usuario) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setSelectedUser(null);
    }
  };

  // Callback que se dispara al crear o editar un usuario exitosamente
  const handleSuccess = () => {
    // Alterna el flag para forzar que UserTable se remonte y obtenga la data actualizada
    setRefresh((prev) => !prev);
  };

  return (
    <ContentLayout title="Gestión de Usuarios">
      <div className="flex justify-end mb-4">
        <Dialog open={isFormOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>Crear Usuario</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[425px] md:max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? "Editar Usuario" : "Crear Usuario"}
              </DialogTitle>
              <DialogDescription>
                {selectedUser
                  ? "Realiza cambios en la información del usuario."
                  : "Agrega un nuevo usuario al sistema."}
              </DialogDescription>
            </DialogHeader>
            <UserForm
              user={selectedUser}
              onClose={() => setIsFormOpen(false)}
              onSuccess={handleSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>
      <UserTable key={refresh.toString()} onEdit={handleEdit} />
    </ContentLayout>
  );
};

export default UsersPage;

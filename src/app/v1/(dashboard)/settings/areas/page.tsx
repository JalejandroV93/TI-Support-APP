/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/v1/(dashboard)/settings/areas/page.tsx
"use client";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { AreaTable } from "@/components/admin-panel/settings/area-table"; // Import
import { AreaForm } from "@/components/admin-panel/settings/area-form";   // Import
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import { useReportAreaStore } from "@/store/reportAreaStore"; // Import

const AreasPage = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedArea, setSelectedArea] = useState<any>(null); // Adjust 'any'
    const { fetchAreas } = useReportAreaStore();               // Use store

    const handleEdit = (area: any) => { // Adjust 'any'
      setSelectedArea(area);
      setIsFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedArea(null); // Clear any previous selection
        setIsFormOpen(true);
    }

    const handleDialogOpenChange = (open: boolean) => {
        setIsFormOpen(open);
        if (!open) {
            setSelectedArea(null); // Clear selection on close
        }
    };

    const handleSuccess = () => {
        fetchAreas(); // Use store action
    }

    return (
      <ContentLayout title="Áreas de Reporte">
        <div className="flex justify-end mb-4">
          <Dialog open={isFormOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button onClick={handleAdd}>Crear Área</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[425px] md:max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedArea ? "Editar Área" : "Crear Área"}
                </DialogTitle>
                <DialogDescription>
                  {selectedArea
                    ? "Realiza cambios en la información del área."
                    : "Agrega una nueva área al sistema."}
                </DialogDescription>
              </DialogHeader>
              <AreaForm
                area={selectedArea}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
        <AreaTable onEdit={handleEdit} />
      </ContentLayout>
    );
  };

  export default AreasPage;
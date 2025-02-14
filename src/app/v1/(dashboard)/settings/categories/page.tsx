/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/v1/(dashboard)/settings/categories/page.tsx
"use client";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { CategoryTable } from "@/components/admin-panel/settings/category-table";
import { CategoryForm } from "@/components/admin-panel/settings/category-form";
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
import { useCategoryStore } from "@/store/categoryStore";

const CategoriesPage = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null); // Adjust 'any'
    const { fetchCategories } = useCategoryStore();

    const handleEdit = (category: any) => { // Adjust 'any'
      setSelectedCategory(category);
      setIsFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedCategory(null); // Clear any previous selection
        setIsFormOpen(true);
    }

    const handleDialogOpenChange = (open: boolean) => {
        setIsFormOpen(open);
        if (!open) {
            setSelectedCategory(null); // Clear selection on close
        }
    };

    const handleSuccess = () => {
        fetchCategories();
    }

    return (
      <ContentLayout title="Categorías de Soporte">
        <div className="flex justify-end mb-4">
          <Dialog open={isFormOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button onClick={handleAdd}>Crear Categoria</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[425px] md:max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedCategory ? "Editar Categoria" : "Crear Categoria"}
                </DialogTitle>
                <DialogDescription>
                  {selectedCategory
                    ? "Realiza cambios en la información de la categoría."
                    : "Agrega un nuevo categoría al sistema."}
                </DialogDescription>
              </DialogHeader>
              <CategoryForm
                category={selectedCategory}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
        <CategoryTable onEdit={handleEdit} />
      </ContentLayout>
    );
  };

  export default CategoriesPage;
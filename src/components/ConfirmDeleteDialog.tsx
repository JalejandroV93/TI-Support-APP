// src/components/ConfirmDeleteDialog.tsx
"use client";
import React, { useState } from "react";
import {
  Button,
} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ConfirmDeleteDialogProps {
  open: boolean;
  title: string;
  description: string;
  reportNumber: string; // Report number to display
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  title,
  description,
  reportNumber,
  onConfirm,
  onCancel,
}) => {
  const [inputReportNumber, setInputReportNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (inputReportNumber === reportNumber) {
      setError(null);
      onConfirm();
    } else {
      setError("El número de reporte no coincide.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description} <br />
            Escribe <strong>{reportNumber}</strong> para confirmar.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="text"
          placeholder="Número de Reporte"
          value={inputReportNumber}
          onChange={(e) => setInputReportNumber(e.target.value)}
          aria-describedby="report-number-error"
        />
         {error && (
            <p id="report-number-error" className="text-red-500 text-sm mt-1">{error}</p>
         )}
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={inputReportNumber !== reportNumber}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
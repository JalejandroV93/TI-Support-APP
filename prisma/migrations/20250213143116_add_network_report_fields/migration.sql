/*
  Warnings:

  - You are about to drop the column `fecha` on the `RedReport` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[numeroReporte]` on the table `RedReport` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `estado` to the `RedReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaIncidente` to the `RedReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prioridad` to the `RedReport` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RedEstado" AS ENUM ('ABIERTO', 'EN_PROCESO', 'RESUELTO', 'CERRADO');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- AlterEnum
ALTER TYPE "RedTipo" ADD VALUE 'MANTENIMIENTO';

-- AlterTable
ALTER TABLE "RedReport" DROP COLUMN "fecha",
ADD COLUMN     "direccionIP" TEXT,
ADD COLUMN     "direccionMAC" TEXT,
ADD COLUMN     "dispositivo" TEXT,
ADD COLUMN     "estado" "RedEstado" NOT NULL,
ADD COLUMN     "fechaIncidente" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notasTecnicas" TEXT,
ADD COLUMN     "numeroReporte" TEXT NOT NULL DEFAULT 'RR-',
ADD COLUMN     "prioridad" "Prioridad" NOT NULL,
ADD COLUMN     "solucion" TEXT,
ADD COLUMN     "tecnico" TEXT,
ADD COLUMN     "ubicacion" TEXT;

-- CreateIndex
CREATE INDEX "MantenimientoReport_userId_idx" ON "MantenimientoReport"("userId");

-- CreateIndex
CREATE INDEX "MantenimientoReport_fechaRecibido_idx" ON "MantenimientoReport"("fechaRecibido");

-- CreateIndex
CREATE INDEX "MantenimientoReport_tecnico_idx" ON "MantenimientoReport"("tecnico");

-- CreateIndex
CREATE UNIQUE INDEX "RedReport_numeroReporte_key" ON "RedReport"("numeroReporte");

-- CreateIndex
CREATE INDEX "RedReport_userId_idx" ON "RedReport"("userId");

-- CreateIndex
CREATE INDEX "RedReport_fechaIncidente_idx" ON "RedReport"("fechaIncidente");

-- CreateIndex
CREATE INDEX "RedReport_tecnico_idx" ON "RedReport"("tecnico");

-- CreateIndex
CREATE INDEX "RedReport_estado_idx" ON "RedReport"("estado");

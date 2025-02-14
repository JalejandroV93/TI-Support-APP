/*
  Warnings:

  - Added the required column `reporteArea` to the `SoporteReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoUsuario` to the `SoporteReport` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('DOCENTE', 'ADMINISTRATIVO', 'DIRECTIVO', 'OTRO');

-- CreateEnum
CREATE TYPE "ReporteArea" AS ENUM ('LABORATORIO', 'SALON', 'OFICINA', 'AUDITORIO', 'OTRO');

-- CreateEnum
CREATE TYPE "SoporteEstado" AS ENUM ('ABIERTO', 'EN_PROCESO', 'PENDIENTE_POR_TERCERO', 'RESUELTO', 'CERRADO');

-- AlterTable
ALTER TABLE "SoporteReport" ADD COLUMN     "estado" "SoporteEstado" NOT NULL DEFAULT 'ABIERTO',
ADD COLUMN     "fechaSolucion" TIMESTAMP(3),
ADD COLUMN     "fueSolucionado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notasTecnicas" TEXT,
ADD COLUMN     "reporteArea" "ReporteArea" NOT NULL,
ADD COLUMN     "solucion" TEXT,
ADD COLUMN     "tipoUsuario" "TipoUsuario" NOT NULL;

-- CreateIndex
CREATE INDEX "SoporteReport_userId_idx" ON "SoporteReport"("userId");

-- CreateIndex
CREATE INDEX "SoporteReport_fecha_idx" ON "SoporteReport"("fecha");

-- CreateIndex
CREATE INDEX "SoporteReport_estado_idx" ON "SoporteReport"("estado");

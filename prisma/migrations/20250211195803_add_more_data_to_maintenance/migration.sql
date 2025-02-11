/*
  Warnings:

  - You are about to drop the column `fecha` on the `MantenimientoReport` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[numeroReporte]` on the table `MantenimientoReport` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `diagnostico` to the `MantenimientoReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaRecibido` to the `MantenimientoReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tecnico` to the `MantenimientoReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MantenimientoReport" DROP COLUMN "fecha",
ADD COLUMN     "causa" TEXT,
ADD COLUMN     "diagnostico" TEXT NOT NULL,
ADD COLUMN     "falla" TEXT,
ADD COLUMN     "fechaEntrega" TIMESTAMP(3),
ADD COLUMN     "fechaRecibido" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "marca" TEXT,
ADD COLUMN     "memoria_ram" TEXT,
ADD COLUMN     "modelo" TEXT,
ADD COLUMN     "numeroReporte" TEXT NOT NULL DEFAULT 'RM-',
ADD COLUMN     "procesador" TEXT,
ADD COLUMN     "sistema_operativo" TEXT,
ADD COLUMN     "solucion" TEXT,
ADD COLUMN     "tecnico" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MantenimientoReport_numeroReporte_key" ON "MantenimientoReport"("numeroReporte");

/*
  Warnings:

  - You are about to drop the column `fecha` on the `AulaMovilReport` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[numeroReporte]` on the table `AulaMovilReport` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fechaIncidente` to the `AulaMovilReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoNovedad` to the `AulaMovilReport` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoNovedad" AS ENUM ('INSTALACION_APP', 'DANIO_FISICO', 'FALLA_SOFTWARE', 'PERDIDA', 'OTRO');

-- AlterTable
ALTER TABLE "AulaMovilReport" DROP COLUMN "fecha",
ADD COLUMN     "estudiante" TEXT,
ADD COLUMN     "fechaIncidente" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "gradoEstudiante" TEXT,
ADD COLUMN     "numeroReporte" TEXT NOT NULL DEFAULT 'AM-',
ADD COLUMN     "observaciones" TEXT,
ADD COLUMN     "tipoNovedad" "TipoNovedad" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AulaMovilReport_numeroReporte_key" ON "AulaMovilReport"("numeroReporte");

-- CreateIndex
CREATE INDEX "AulaMovilReport_userId_idx" ON "AulaMovilReport"("userId");

-- CreateIndex
CREATE INDEX "AulaMovilReport_fechaIncidente_idx" ON "AulaMovilReport"("fechaIncidente");

-- CreateIndex
CREATE INDEX "AulaMovilReport_tipoNovedad_idx" ON "AulaMovilReport"("tipoNovedad");

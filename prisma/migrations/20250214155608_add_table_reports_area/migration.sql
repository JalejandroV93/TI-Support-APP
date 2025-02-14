/*
  Warnings:

  - You are about to drop the column `notasTecnicas` on the `SoporteReport` table. All the data in the column will be lost.
  - You are about to drop the column `reporteArea` on the `SoporteReport` table. All the data in the column will be lost.
  - Added the required column `reporteAreaId` to the `SoporteReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SoporteReport" DROP COLUMN "notasTecnicas",
DROP COLUMN "reporteArea",
ADD COLUMN     "nombrePersona" TEXT,
ADD COLUMN     "notas" TEXT,
ADD COLUMN     "reporteAreaId" INTEGER NOT NULL,
ADD COLUMN     "ubicacionDetalle" TEXT;

-- DropEnum
DROP TYPE "ReporteArea";

-- CreateTable
CREATE TABLE "ReporteArea" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "ReporteArea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReporteArea_nombre_key" ON "ReporteArea"("nombre");

-- AddForeignKey
ALTER TABLE "SoporteReport" ADD CONSTRAINT "SoporteReport_reporteAreaId_fkey" FOREIGN KEY ("reporteAreaId") REFERENCES "ReporteArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

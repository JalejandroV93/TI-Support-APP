/*
  Warnings:

  - A unique constraint covering the columns `[numeroReporte]` on the table `SoporteReport` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SoporteReport" ADD COLUMN     "numeroReporte" TEXT NOT NULL DEFAULT 'SS-';

-- CreateIndex
CREATE UNIQUE INDEX "SoporteReport_numeroReporte_key" ON "SoporteReport"("numeroReporte");

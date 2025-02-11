/*
  Warnings:

  - You are about to drop the column `estadoAntes` on the `MantenimientoReport` table. All the data in the column will be lost.
  - You are about to drop the column `estadoDespues` on the `MantenimientoReport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MantenimientoReport" DROP COLUMN "estadoAntes",
DROP COLUMN "estadoDespues";

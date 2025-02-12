/*
  Warnings:

  - You are about to drop the column `causa` on the `MantenimientoReport` table. All the data in the column will be lost.
  - You are about to drop the column `falla` on the `MantenimientoReport` table. All the data in the column will be lost.
  - Added the required column `tipoMantenimiento` to the `MantenimientoReport` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoMantenimiento" AS ENUM ('PREVENTIVO', 'CORRECTIVO', 'OTRO');

-- AlterTable
ALTER TABLE "MantenimientoReport" DROP COLUMN "causa",
DROP COLUMN "falla",
ADD COLUMN     "tipoMantenimiento" "TipoMantenimiento" NOT NULL;

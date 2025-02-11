-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'COLABORADOR');

-- CreateEnum
CREATE TYPE "RedTipo" AS ENUM ('DANIO', 'CAMBIO', 'REPARACION', 'OTRO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoporteCategoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "SoporteCategoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoporteReport" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "SoporteReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MantenimientoReport" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "equipo" TEXT NOT NULL,
    "estadoAntes" TEXT NOT NULL,
    "estadoDespues" TEXT NOT NULL,
    "observaciones" TEXT,
    "detallesProceso" TEXT,

    CONSTRAINT "MantenimientoReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedReport" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" "RedTipo" NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "RedReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AulaMovilReport" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tabletId" TEXT,
    "novedades" TEXT NOT NULL,

    CONSTRAINT "AulaMovilReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "SoporteCategoria_nombre_key" ON "SoporteCategoria"("nombre");

-- AddForeignKey
ALTER TABLE "SoporteReport" ADD CONSTRAINT "SoporteReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoporteReport" ADD CONSTRAINT "SoporteReport_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "SoporteCategoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MantenimientoReport" ADD CONSTRAINT "MantenimientoReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedReport" ADD CONSTRAINT "RedReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AulaMovilReport" ADD CONSTRAINT "AulaMovilReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

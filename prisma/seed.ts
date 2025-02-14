// prisma/seed.ts
import { PrismaClient, TipoNovedad } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // --- Categorías de Soporte ---
  const categories = [
    { nombre: "Hardware - Equipos de Escritorio", descripcion: "Problemas con computadoras de escritorio (CPU, monitores, periféricos)." },
    { nombre: "Hardware - Portátiles", descripcion: "Problemas específicos de computadoras portátiles (batería, pantalla, teclado, etc.)." },
    { nombre: "Hardware - Tablets", descripcion: "Problemas con las tabletas utilizadas en las aulas." },
    { nombre: "Hardware - Impresoras", descripcion: "Mal funcionamiento de la impresora, conectividad y problemas de suministro." },
    { nombre: "Hardware - Proyectores", descripcion: "Problemas con los proyectores (bombillas, conectividad, calidad de imagen)." },
    { nombre: "Hardware - Televisores", descripcion: "Problemas de visualización o conectividad de TV." },
    { nombre: "Hardware - Audio", descripcion: "Problemas con los sistemas de audio del aula (micrófonos, altavoces, amplificadores)." },
    { nombre: "Hardware - Otros", descripcion: "Cualquier otro hardware no cubierto anteriormente." },
    { nombre: "Software - Sistema Operativo", descripcion: "Problemas con Windows, macOS, ChromeOS, etc." },
    { nombre: "Software - Aplicaciones", descripcion: "Problemas con software específico (Office, aplicaciones educativas, etc.)." },
    { nombre: "Software - Instalación/Actualizaciones", descripcion: "Problemas al instalar o actualizar software." },
    { nombre: "Red - Wi-Fi", descripcion: "Problemas de conectividad Wi-Fi." },
    { nombre: "Red - Cableada", descripcion: "Problemas con las conexiones de red cableadas." },
    { nombre: "Red - Acceso a Internet", descripcion: "Problemas generales de acceso a Internet." },
    { nombre: "Red - Otros", descripcion: "Otros problemas relacionados con la red." },
    { nombre: "Cuentas - Restablecimiento de Contraseña", descripcion: "Restablecimiento de contraseñas para cuentas de usuario." },
    { nombre: "Cuentas - Problemas de Acceso", descripcion: "Problemas para iniciar sesión o acceder a recursos." },
    { nombre: "Cuentas - Creación de Nueva Cuenta", descripcion: "Solicitudes de nuevas cuentas de personal." },
    { nombre: "Tecnología en el Aula - Pizarra Interactiva", descripcion: "Problemas con las pizarras interactivas." },
    { nombre: "Seguridad - Virus/Malware", descripcion: "Infecciones de virus/malware sospechosas o confirmadas." },
    { nombre: "Seguridad - Phishing", descripcion: "Reporte de intentos de phishing." },
    { nombre: "Capacitación - Software/Hardware", descripcion: "Solicitudes de capacitación sobre tecnologías específicas." },
    { nombre: "Otros", descripcion: "Una categoría general para problemas que no encajan en otros lugares." },
  ];

  for (const category of categories) {
    await prisma.soporteCategoria.upsert({
      where: { nombre: category.nombre },
      update: {},
      create: category,
    });
  }
  console.log("Categorías de soporte creadas/actualizadas exitosamente.");

  // --- Áreas de Reporte ---
  const reportAreas = [
    { nombre: "Salón", descripcion: "Salas de clase regulares." },
    { nombre: "Oficinas", descripcion: "Oficinas administrativas." },
    { nombre: "Bloque", descripcion: "Edificios o bloques específicos." },
    { nombre: "Biblioteca", descripcion: "Área de la biblioteca." },
    { nombre: "Audiovisuales", descripcion: "Salas de audiovisuales." },
    { nombre: "Música", descripcion: "Salas de música." },
    { nombre: "Mi Taller", descripcion: "Talleres de trabajo." },
  ];

  for (const area of reportAreas) {
    await prisma.reporteArea.upsert({
      where: { nombre: area.nombre },
      update: {},
      create: area,
    });
  }
  console.log("Áreas de reporte creadas/actualizadas exitosamente.");

  // --- Usuarios ---
  const hashedPassword = await bcrypt.hash("password123", 10); // ¡Recuerda usar una contraseña robusta en producción!

  const admin = await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      nombre: 'Admin User',
      email: 'admin@example.com',
      rol: 'ADMIN',
    },
  });

  const collaborators = [];
  for (let i = 1; i <= 3; i++) {
    const colaborador = await prisma.usuario.upsert({
      where: { username: `colaborador${i}` },
      update: {},
      create: {
        username: `colaborador${i}`,
        password: hashedPassword,
        nombre: `Colaborador ${i}`,
        email: `colaborador${i}@example.com`,
        rol: 'COLABORADOR',
      },
    });
    collaborators.push(colaborador);
  }
  console.log("Usuarios creados/actualizados exitosamente.");

  const allUsers = [admin, ...collaborators];

  // --- Reportes de Mantenimiento ---
  for (let i = 0; i < 20; i++) {
    const user = allUsers[i % allUsers.length];
    const numeroReporte = `RM-${(i + 1).toString().padStart(4, "0")}`;
    await prisma.mantenimientoReport.create({
      data: {
        numeroReporte,
        userId: user.id,
        fechaRecibido: new Date(),
        fechaEntrega: i % 3 === 0 ? new Date(Date.now() + 86400000) : null, // Algunos reportes tienen fecha de entrega
        tipoEquipo: i % 2 === 0 ? "Laptop" : "Desktop",
        equipo: `Equipo ${i + 1}`,
        marca: i % 2 === 0 ? "Dell" : "HP",
        modelo: `Modelo ${i + 1}`,
        sistemaOp: i % 2 === 0 ? "Windows 10" : "Ubuntu 20.04",
        procesador: i % 2 === 0 ? "Intel i5" : "AMD Ryzen 5",
        ram: i % 2 === 0 ? "8GB" : "16GB",
        ramCantidad: i % 2 === 0 ? 8 : 16,
        tipoMantenimiento: i % 2 === 0 ? "PREVENTIVO" : "CORRECTIVO",
        diagnostico: i % 2 === 0 ? `Diagnóstico ${i + 1}` : null,
        solucion: i % 2 !== 0 ? `Solución ${i + 1}` : null,
        observaciones: i % 2 !== 0 ? `Observaciones ${i + 1}` : null,
        tecnico: `Tecnico ${i % 3 + 1}`, // Alterna entre distintos técnicos
        detallesProceso: i % 2 !== 0 ? `Detalles del proceso ${i + 1}` : null,
      },
    });
  }
  console.log("Reportes de mantenimiento creados exitosamente.");

  // --- Reportes de Red ---
  for (let i = 0; i < 20; i++) {
    const user = allUsers[i % allUsers.length];
    const numeroReporte = `RR-${(i + 1).toString().padStart(4, "0")}`;
    await prisma.redReport.create({
      data: {
        numeroReporte,
        userId: user.id,
        fechaIncidente: new Date(Date.now() - i * 3600000), // Incidentes en el pasado
        ubicacion: `Ubicación ${i + 1}`,
        tipo: i % 2 === 0 ? "DANIO" : "REPARACION",
        descripcion: `Incidente de red ${i + 1}`,
        dispositivo: i % 2 === 0 ? "Router" : "Switch",
        direccionIP: `192.168.1.${i + 1}`,
        estado: i % 3 === 0 ? "ABIERTO" : (i % 3 === 1 ? "EN_PROCESO" : "RESUELTO"),
        prioridad: i % 4 === 0 ? "URGENTE" : (i % 4 === 1 ? "ALTA" : (i % 4 === 2 ? "MEDIA" : "BAJA")),
        tecnico: `Tecnico ${i % 3 + 1}`,
        notasTecnicas: i % 2 === 0 ? `Notas técnicas ${i + 1}` : null,
        solucion: i % 2 !== 0 ? `Solución aplicada ${i + 1}` : null,
      },
    });
  }
  console.log("Reportes de red creados exitosamente.");

  // --- Reportes de Aulas Móviles ---
  const tiposNovedadArray = Object.values(TipoNovedad);
  for (let i = 0; i < 20; i++) {
    const user = allUsers[i % allUsers.length];
    const numeroReporte = `AM-${(i + 1).toString().padStart(4, "0")}`;
    await prisma.aulaMovilReport.create({
      data: {
        numeroReporte,
        userId: user.id,
        fechaIncidente: new Date(Date.now() - i * 7200000), // Incidentes en el pasado
        tabletId: i % 2 === 0 ? `Tablet-${i + 1}` : null,
        novedades: `Novedad ${i + 1}`,
        tipoNovedad: tiposNovedadArray[i % tiposNovedadArray.length],
        estudiante: i % 3 === 0 ? `Estudiante ${i + 1}` : null,
        gradoEstudiante: i % 3 === 0 ? `Grado ${i % 5 + 1}` : null,
        observaciones: i % 2 !== 0 ? `Observaciones de aula móvil ${i + 1}` : null,
      },
    });
  }
  console.log("Reportes de aulas móviles creados exitosamente.");

  // --- Reportes de Soporte ---
  const allCategories = await prisma.soporteCategoria.findMany();
  const allReportAreas = await prisma.reporteArea.findMany();
  for (let i = 0; i < 20; i++) {
    const user = allUsers[i % allUsers.length];
    const numeroReporte = `SS-${(i + 1).toString().padStart(4, "0")}`;
    await prisma.soporteReport.create({
      data: {
        numeroReporte,
        userId: user.id,
        categoriaId: allCategories[i % allCategories.length].id,
        reporteAreaId: allReportAreas[i % allReportAreas.length].id,
        tipoUsuario: i % 2 === 0 ? "DOCENTE" : "ADMINISTRATIVO",
        nombrePersona: i % 2 === 0 ? `Persona ${i + 1}` : null,
        ubicacionDetalle: i % 3 === 0 ? `Ubicación detallada ${i + 1}` : null,
        descripcion: `Problema de soporte ${i + 1}`,
        solucion: i % 3 === 1 ? `Solución implementada ${i + 1}` : null,
        estado: i % 3 === 0 ? "ABIERTO" : (i % 3 === 1 ? "EN_PROCESO" : "RESUELTO"),
        fueSolucionado: i % 2 === 0,
        notas: i % 2 !== 0 ? `Notas técnicas ${i + 1}` : null,
        fechaSolucion: i % 2 !== 0 ? new Date(Date.now() + 3600000) : null,
      },
    });
  }
  console.log("Reportes de soporte creados exitosamente.");

  console.log("Todos los datos de prueba han sido generados exitosamente.");
}

main()
  .catch((error) => {
    console.error("Error al crear/actualizar datos de prueba:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

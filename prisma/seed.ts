// prisma/seed.ts
import { PrismaClient, TipoNovedad } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // --- Categorías de Soporte (estáticas) ---
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

  // --- Áreas de Reporte (estáticas) ---
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
  const hashedPassword = await bcrypt.hash("password123", 10); // Recuerda usar una contraseña robusta en producción

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
    const fechaRecibido = faker.date.past();
    const fechaEntrega = faker.datatype.boolean() ? faker.date.future() : null;
    const tipoEquipo = faker.helpers.arrayElement(["Laptop", "Desktop", "Tablet", "Servidor"]);
    const equipo = faker.commerce.productName();
    const marca = faker.company.name();
    const modelo = faker.vehicle.model();
    const sistemaOp = faker.helpers.arrayElement(["Windows 10", "Ubuntu 20.04", "macOS Monterey", "Linux"]);
    const procesador = faker.helpers.arrayElement(["Intel i5", "Intel i7", "AMD Ryzen 5", "AMD Ryzen 7"]);
    const ramValue = faker.helpers.arrayElement(["8GB", "16GB", "32GB"]);
    const ramCantidad = parseInt(ramValue);
    const tipoMantenimiento = faker.helpers.arrayElement(["PREVENTIVO", "CORRECTIVO", "OTRO"]);
    const diagnostico = faker.lorem.sentence();
    const solucion = faker.datatype.boolean() ? faker.lorem.sentence() : null;
    const observaciones = faker.datatype.boolean() ? faker.lorem.sentence() : null;
    const tecnico = faker.person.fullName();
    const detallesProceso = faker.datatype.boolean() ? faker.lorem.paragraph() : null;

    await prisma.mantenimientoReport.create({
      data: {
        numeroReporte,
        userId: user.id,
        fechaRecibido,
        fechaEntrega,
        tipoEquipo,
        equipo,
        marca,
        modelo,
        sistemaOp,
        procesador,
        ram: ramValue,
        ramCantidad,
        tipoMantenimiento,
        diagnostico,
        solucion,
        observaciones,
        tecnico,
        detallesProceso,
      },
    });
  }
  console.log("Reportes de mantenimiento creados exitosamente.");

  // --- Reportes de Red ---
  for (let i = 0; i < 20; i++) {
    const user = allUsers[i % allUsers.length];
    const numeroReporte = `RR-${(i + 1).toString().padStart(4, "0")}`;
    const fechaIncidente = faker.date.past();
    const ubicacion = faker.datatype.boolean() ? faker.address.streetAddress() : null;
    const tipo = faker.helpers.arrayElement(["DANIO", "CAMBIO", "REPARACION", "MANTENIMIENTO", "OTRO"]);
    const descripcion = faker.lorem.sentence();
    const dispositivo = faker.datatype.boolean() ? faker.helpers.arrayElement(["Router", "Switch", "Punto de Acceso", "Cableado"]) : null;
    const direccionIP = faker.datatype.boolean() ? faker.internet.ip() : null;
    const estado = faker.helpers.arrayElement(["ABIERTO", "EN_PROCESO", "RESUELTO", "CERRADO"]);
    const prioridad = faker.helpers.arrayElement(["BAJA", "MEDIA", "ALTA", "URGENTE"]);
    const tecnico = faker.datatype.boolean() ? faker.name.fullName() : null;
    const notasTecnicas = faker.datatype.boolean() ? faker.lorem.sentence() : null;
    const solucion = faker.datatype.boolean() ? faker.lorem.sentence() : null;
    const fueSolucionado = faker.datatype.boolean();

    await prisma.redReport.create({
      data: {
        numeroReporte,
        userId: user.id,
        fechaIncidente,
        ubicacion,
        tipo,
        descripcion,
        dispositivo,
        direccionIP,
        estado,
        prioridad,
        tecnico,
        notasTecnicas,
        solucion,
        fueSolucionado,
      },
    });
  }
  console.log("Reportes de red creados exitosamente.");

  // --- Reportes de Aulas Móviles ---
  const tiposNovedad = ["INSTALACION_APP", "DANIO_FISICO", "FALLA_SOFTWARE", "PERDIDA", "OTRO"];
  for (let i = 0; i < 20; i++) {
    const user = allUsers[i % allUsers.length];
    const numeroReporte = `AM-${(i + 1).toString().padStart(4, "0")}`;
    const fechaIncidente = faker.date.past();
    const tabletId = faker.datatype.boolean() ? `Tablet-${faker.string.uuid()}` : null;
    const novedades = faker.lorem.sentence();
    const tipoNovedad = faker.helpers.arrayElement(tiposNovedad) as TipoNovedad;
    const estudiante = faker.datatype.boolean() ? faker.name.firstName() : null;
    const gradoEstudiante = faker.datatype.boolean() ? `Grado ${faker.number.int({ min: 1, max: 12 })}` : null;
    const observaciones = faker.datatype.boolean() ? faker.lorem.sentence() : null;
    const docente = faker.datatype.boolean() ? faker.name.fullName() : null;
    const salon = faker.datatype.boolean() ? faker.helpers.arrayElement(["Aula 101", "Aula 202", "Laboratorio 3", "Salón 1"]) : null;

    await prisma.aulaMovilReport.create({
      data: {
        numeroReporte,
        userId: user.id,
        fechaIncidente,
        tabletId,
        novedades,
        tipoNovedad,
        estudiante,
        gradoEstudiante,
        observaciones,
        docente,
        salon,
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
    const categoria = allCategories[faker.number.int({ min: 0, max: allCategories.length - 1 })];
    const reporteArea = allReportAreas[faker.number.int({ min: 0, max: allReportAreas.length - 1 })];
    const tipoUsuario = faker.helpers.arrayElement(["DOCENTE", "ADMINISTRATIVO", "DIRECTIVO", "OTRO"]);
    const nombrePersona = faker.datatype.boolean() ? faker.person.fullName() : null;
    const ubicacionDetalle = faker.datatype.boolean() ? faker.address.streetAddress() : null;
    const descripcion = faker.lorem.sentence();
    const solucion = faker.datatype.boolean() ? faker.lorem.sentence() : null;
    const estado = faker.helpers.arrayElement(["ABIERTO", "EN_PROCESO", "PENDIENTE_POR_TERCERO", "RESUELTO", "CERRADO"]);
    const fueSolucionado = faker.datatype.boolean();
    const notas = faker.datatype.boolean() ? faker.lorem.sentence() : null;
    const fechaSolucion = faker.datatype.boolean() ? faker.date.future() : null;

    await prisma.soporteReport.create({
      data: {
        numeroReporte,
        userId: user.id,
        categoriaId: categoria.id,
        reporteAreaId: reporteArea.id,
        tipoUsuario,
        nombrePersona,
        ubicacionDetalle,
        descripcion,
        solucion,
        estado,
        fueSolucionado,
        notas,
        fechaSolucion,
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

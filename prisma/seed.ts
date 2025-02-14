// prisma/seed.ts
import { PrismaClient, ReporteArea, TipoUsuario } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // --- Categories (from previous seed) ---
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
    { nombre: "Cuentas - Creación de Nueva Cuenta", descripcion: "Solicitudes de nuevas cuentas de personal." }, //  "staff accounts" translates more to employee accounts.
    { nombre: "Tecnología en el Aula - Pizarra Interactiva", descripcion: "Problemas con las pizarras interactivas." },
    { nombre: "Seguridad - Virus/Malware", descripcion: "Infecciones de virus/malware sospechosas o confirmadas." },
    { nombre: "Seguridad - Phishing", descripcion: "Reporte de intentos de phishing." },
    { nombre: "Capacitación - Software/Hardware", descripcion: "Solicitudes de capacitación sobre tecnologías específicas." },
    { nombre: "Otros", descripcion: "Una categoría general para problemas que no encajan en otros lugares." },
  ];

  try {
    for (const category of categories) {
      await prisma.soporteCategoria.upsert({
        where: { nombre: category.nombre },
        update: {},
        create: category,
      });
    }
    console.log("Categorías de soporte creadas/actualizadas exitosamente.");

    // --- Users ---
    const hashedPassword = await bcrypt.hash("password123", 10); // Use a strong password in production!

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

        // --- Reports ---
    const allUsers = [admin, ...collaborators];

    // Create Maintenance Reports
    for (let i = 0; i < 10; i++) {
        const user = allUsers[i % allUsers.length];
        const numeroReporte = `LTSM-${(i + 1).toString().padStart(4, "0")}`;
        await prisma.mantenimientoReport.create({
          data: {
            numeroReporte,
            userId: user.id,
            fechaRecibido: new Date(),
            tipoMantenimiento: i % 2 === 0 ? "PREVENTIVO" : "CORRECTIVO",
            equipo: `Equipo ${i + 1}`,
            tecnico: `Tecnico ${i % 3 + 1}`, // Cycle through technicians 1, 2, 3
            diagnostico: i % 2 === 0 ? `Diagnostico ${i + 1}` : null,
            solucion: i % 2 !== 0 ? `Solucion ${i + 1}` : null,
            detallesProceso: i % 2 !== 0 ? `Detalles ${i + 1}` : null,
          },
        });
    }

    // Create Network Reports
    for (let i = 0; i < 10; i++) {
        const user = allUsers[i % allUsers.length];
        const numeroReporte = `RR-${(i + 1).toString().padStart(4, "0")}`;
        await prisma.redReport.create({
            data: {
            numeroReporte,
            userId: user.id,
            fechaIncidente: new Date(),
            tipo: i % 2 === 0 ? "DANIO" : "REPARACION",
            estado: i % 3 === 0 ? "ABIERTO" : (i % 3 === 1 ? "EN_PROCESO" : "RESUELTO"),
            prioridad: i % 2 === 0 ? "ALTA" : "MEDIA",
            },
        });
    }

      // Create Mobile Classroom Reports
      for (let i = 0; i < 10; i++) {
        const user = allUsers[i % allUsers.length];
        const numeroReporte = `AM-${(i + 1).toString().padStart(4, "0")}`;
        await prisma.aulaMovilReport.create({
          data: {
            numeroReporte,
            userId: user.id,
            fechaIncidente: new Date(),
            tipoNovedad: i % 2 === 0 ? "DANIO_FISICO" : "FALLA_SOFTWARE",
            novedades: `Novedad ${i + 1}`,
          },
        });
      }


      const allCategories = await prisma.soporteCategoria.findMany();
      // Create Support Reports
      for (let i = 0; i < 10; i++) {
        const user = allUsers[i % allUsers.length];
        const numeroReporte = `SS-${(i+1).toString().padStart(4, '0')}`;
        await prisma.soporteReport.create({
          data: {
            numeroReporte,
            userId: user.id,
            categoriaId: allCategories[i % allCategories.length].id,  // Random category
            descripcion: `Problema de soporte ${i + 1}`,
            reporteArea: i % 2 === 0 ? ReporteArea.LABORATORIO : ReporteArea.OFICINA,
            tipoUsuario: i % 2 === 0 ? TipoUsuario.DOCENTE : TipoUsuario.ADMINISTRATIVO,
            estado:  i % 3 === 0 ? "ABIERTO" : (i % 3 === 1 ? "EN_PROCESO" : "RESUELTO"),
            fueSolucionado: i % 2 === 0 ? true: false
          },
        });
      }


    console.log("Usuarios y reportes de prueba creados exitosamente.");
  } catch (error) {
    console.error("Error al crear/actualizar datos de prueba:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
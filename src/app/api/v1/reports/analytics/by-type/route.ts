/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/app/api/v1/reports/analytics/by-type/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { format, startOfDay, endOfDay, subMonths, subDays } from "date-fns"; // Import date-fns functions

export async function GET(request: Request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "daily"; // 'daily' or 'monthly'
    const months = parseInt(searchParams.get("months") || "3", 10); // Default to 3 months

    // --- Input Validation ---
    if (!["daily", "monthly"].includes(period)) {
        return NextResponse.json({ error: "Invalid period" }, { status: 400 });
    }
    if (isNaN(months) || months < 1 || months > 12) { // Limit months to 1-12
        return NextResponse.json({ error: "Invalid months value" }, { status: 400 });
    }

    const startDate = period === "daily" ? subDays(new Date(), months * 30) : subMonths(new Date(), months); // Calculate the date range
    const endDate = new Date();
    try {
        // --- 1. Fetch and Group Maintenance Reports ---
        const maintenanceReports = await prisma.mantenimientoReport.groupBy({
            by: [period === "daily" ? "fechaRegistro" : "tipoMantenimiento"],
            where: {
                fechaRegistro: {
                    gte: startOfDay(startDate),
                    lte: endOfDay(endDate),
                },
                ...(currentUser.rol !== "ADMIN" ? { userId: currentUser.id } : {}), //  Admin sees all
            },
            _count: {
                _all: true,
            },
        });

        // --- 2. Fetch and Group Network Reports ---
        const networkReports = await prisma.redReport.groupBy({
            by: [period === "daily" ? "fechaIncidente" : "tipo"],
            where: {
                fechaIncidente: {
                    gte: startOfDay(startDate),
                    lte: endOfDay(endDate),
                },
                ...(currentUser.rol !== "ADMIN" ? { userId: currentUser.id } : {}),
            },
            _count: {
                _all: true,
            },
        });

        // --- 3. Fetch and Group Mobile Classroom Reports ---
        const mobileClassroomReports = await prisma.aulaMovilReport.groupBy({
            by: [period === "daily" ? "fechaIncidente" : "tipoNovedad"],
            where: {
                fechaIncidente: {
                    gte: startOfDay(startDate),
                    lte: endOfDay(endDate),
                },
                ...(currentUser.rol !== "ADMIN" ? { userId: currentUser.id } : {}),
            },
            _count: {
                _all: true,
            },
        });

        // --- 4. Fetch and Group Support Reports ---
        const supportReports = await prisma.soporteReport.groupBy({
            by: [period === "daily" ? "fecha" : "categoriaId"], // Group by categoryId if monthly
            where: {
                fecha: {
                    gte: startOfDay(startDate),
                    lte: endOfDay(endDate),
                },
                ...(currentUser.rol !== "ADMIN" ? { userId: currentUser.id } : {}),
            },
            _count: {
                _all: true,
            },
        });

        // --- Data Transformation ---
        const formattedData: Record<string, any> = {}; // Using Record for dynamic keys

        // Helper function to add data
        const addData = (dateStr: string, type: string, count: number) => {
            if (!formattedData[dateStr]) {
                formattedData[dateStr] = { date: dateStr };
            }
            formattedData[dateStr][type] = count;
        };
        // Process all reports
        maintenanceReports.forEach((report) => {
          const date = new Date(report.fechaRegistro)
          const dateStr = period === "daily" ? format(date, "yyyy-MM-dd") : format(date, "yyyy-MM");
          addData(dateStr, "Mantenimiento", report._count._all);
        });

        networkReports.forEach((report) => {
          const date = new Date(report.fechaIncidente)
          const dateStr = period === "daily" ? format(date, "yyyy-MM-dd") : format(date, "yyyy-MM");
          addData(dateStr, "Red", report._count._all);
        });

        mobileClassroomReports.forEach((report) => {
            const date = new Date(report.fechaIncidente)
            const dateStr = period === "daily" ? format(date, "yyyy-MM-dd") : format(date, "yyyy-MM");
            addData(dateStr, "Aula Movil", report._count._all);
        });

        supportReports.forEach((report) => {
            const date = new Date(report.fecha)
            const dateStr = period === "daily" ? format(date, "yyyy-MM-dd") : format(date, "yyyy-MM");
            addData(dateStr, "Soporte", report._count._all);
        });

        // Convert to array and sort by date
        const sortedData = Object.values(formattedData).sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        return NextResponse.json(sortedData);

    } catch (error) {
        console.error("Error fetching report analytics:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
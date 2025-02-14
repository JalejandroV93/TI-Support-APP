// File: src/app/api/v1/reports/analytics/technician-ranking/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.rol !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const months = parseInt(searchParams.get("months") || "3", 10); // Default to 3 months
  if (isNaN(months) || months < 1 || months > 12) { // Limit months to 1-12
    return NextResponse.json({ error: "Invalid months value" }, { status: 400 });
  }

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  try {
    const technicianRanking = await prisma.mantenimientoReport.groupBy({
      by: ["tecnico"],
      where: {
        fechaRegistro: {
          gte: startDate,
        },
      },
      _count: {
        _all: true, // Count all fields (effectively counts rows)
      },
      orderBy: {
        _count: {
          equipo: "desc", // Order by the count of reports
        },
      },
      take: 10, // Top 10 technicians
    });


    const formattedRanking = technicianRanking.map((tech) => ({
        name: tech.tecnico,
        value: tech._count._all,
    }));

    return NextResponse.json(formattedRanking);
  } catch (error) {
    console.error("Error fetching technician ranking:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
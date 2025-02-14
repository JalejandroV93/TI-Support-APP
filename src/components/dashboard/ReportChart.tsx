// File: src/components/ReportChart.tsx
"use client";
import React, { useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useReportAnalyticsStore } from "@/store/reportAnalyticsStore"; // Import
import { ChartContainer } from "@/components/ui/chart"; //IMPORT
import { Skeleton } from "@/components/ui/skeleton";

const ReportChart = () => {
    const { analyticsData, loading, error, fetchAnalytics } = useReportAnalyticsStore();
    const chartConfig = {
      Mantenimiento: {
        label: "Mantenimiento",
        color: "hsl(var(--chart-1))",
      },
      Red: {
        label: "Red",
        color: "hsl(var(--chart-2))",
      },
      "Aula Movil": {
        label: "Aula Movil",
        color: "hsl(var(--chart-3))",
      },
      Soporte: {
        label: "Soporte",
        color: "hsl(var(--chart-4))",
      },
    };

    useEffect(() => {
        fetchAnalytics('daily', 3); // Fetch data on component mount, default daily, past 3 months
    }, [fetchAnalytics]);

    if (loading) {
      return <Skeleton className="w-full h-[300px]" />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!analyticsData) {
      return <div>No hay datos</div>
    }
    //console.log(analyticsData);

    return (
        <ResponsiveContainer width="100%" height={400}>
      <ChartContainer config={chartConfig}>
          <LineChart
              width={730}
              height={250}
              data={analyticsData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                  type="monotone"
                  dataKey="Mantenimiento"
                  stroke="hsl(var(--chart-1))"
              />
              <Line type="monotone" dataKey="Red" stroke="hsl(var(--chart-2))" />
              <Line
                  type="monotone"
                  dataKey="Aula Movil"
                  stroke="hsl(var(--chart-3))"
              />
              <Line type="monotone" dataKey="Soporte" stroke="hsl(var(--chart-4))" />
          </LineChart>
      </ChartContainer></ResponsiveContainer>
    );
};

export default ReportChart;
"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { UnifiedReportTable } from "@/components/dashboard/UnifiedReportTable";
import { UnifiedReportTableSkeleton } from "@/components/skeletons/SkeletonsUI";
import { useUnifiedReportStore } from "@/store/unifiedReportStore";
import ReportChart from "@/components/dashboard/ReportChart";
import PendingReportsAlert from "@/components/dashboard/PendingReportsAlert";
import TechnicianRanking from "@/components/dashboard/TechnicianRanking";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardPage = () => {
  const { isLoading } = useUnifiedReportStore();
  const { user } = useAuth();

  return (
    <ContentLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Reportes Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <PendingReportsAlert />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Estadísticas de Reportes</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportChart />
          </CardContent>
        </Card>

        {user?.rol === "ADMIN" && (
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Técnicos</CardTitle>
            </CardHeader>
            <CardContent>
              <TechnicianRanking />
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Reportes Unificados</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" className="w-full">
            <TabsList>
              <TabsTrigger value="table">Tabla</TabsTrigger>
              <TabsTrigger value="chart">Gráfico</TabsTrigger>
            </TabsList>
            <TabsContent value="table">
              {isLoading ? <UnifiedReportTableSkeleton /> : <UnifiedReportTable />}
            </TabsContent>
            <TabsContent value="chart">
              <ReportChart />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </ContentLayout>
  );
};

export default DashboardPage;

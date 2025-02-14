// --- src/app/v1/(dashboard)/page.tsx (Modified) ---
"use client"
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { UnifiedReportTable } from "@/components/UnifiedReportTable"; // Import
import { UnifiedReportTableSkeleton } from "@/components/skeletons/SkeletonsUI"; //NEW
import { useUnifiedReportStore } from "@/store/unifiedReportStore";  //NEW

const DashboardPage = () => {
  const { isLoading } = useUnifiedReportStore()
  return (
    <ContentLayout title="Dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Reportes</h2>
        <p className="text-muted-foreground">
          Aquí puedes ver un resumen de todos los reportes.
        </p>
      </div>
      {isLoading ? <UnifiedReportTableSkeleton /> : <UnifiedReportTable />}
    </ContentLayout>
  );
};

export default DashboardPage;
// app/v1/(dashboard)/page.tsx
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";


const DashboardPage = () => {
  return (
    <ContentLayout title="Dashboard">
      <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold mb-4">
        ¡Bienvenido al Dashboard!
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Administra usuarios, reportes y más.
      </p>
      <div className="space-x-4">
        <Button asChild variant="default">
            <Link href={"/v1/users"}>Gestion Usuarios</Link>
        </Button>
      </div>
    </div>
    </ContentLayout>
  );
};

export default DashboardPage;
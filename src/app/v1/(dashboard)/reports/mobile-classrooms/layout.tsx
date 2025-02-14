import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Toaster } from "@/components/ui/sonner"; // Import

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ContentLayout title="Reportes de Aulas Moviles">
      {children} <Toaster />
    </ContentLayout>
  );
}
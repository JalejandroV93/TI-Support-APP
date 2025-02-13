import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Toaster } from "@/components/ui/sonner";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ContentLayout title="Reportes de Mantenimiento">
      {children} <Toaster />
    </ContentLayout>
  );
}

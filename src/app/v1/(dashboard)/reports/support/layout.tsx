import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ContentLayout title="Reportes de Soportes">{children}</ContentLayout>;
}

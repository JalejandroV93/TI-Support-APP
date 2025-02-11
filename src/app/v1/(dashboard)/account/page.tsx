"use client";


import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useAuth } from "@/components/providers/AuthProvider";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { ProfileForm } from "@/components/account/ProfileForm";
import { Skeleton } from "@/components/ui/skeleton"


const AccountPage = () => {
  const { user, isLoading, refetchUser } = useAuth();

  if (isLoading) return <Skeleton className="w-[100px] h-[20px] rounded-full" />;

  return (
    <ContentLayout title="Configuración de Cuenta">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileForm user={user} refetchUser={refetchUser} />
        <ChangePasswordForm refetchUser={refetchUser} />
      </div>
    </ContentLayout>
  );
};

export default AccountPage;

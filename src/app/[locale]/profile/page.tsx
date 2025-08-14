import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { setRequestLocale } from "next-intl/server";
import UserProfile from "../../../components/setting-menu/profile";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <PageHeaderClient
          title={"Profile"}
          showThemeToggle={true}
          showLanguageSwitcher={true}
        />

        {/* Main Content */}
        <UserProfile />
      </div>
    </DashboardLayout>
  );
}

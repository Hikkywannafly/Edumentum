import { RoleSelector } from "@/components/auth/role-selector";
import { BaseLayout } from "@/components/layout";
import { setRequestLocale } from "next-intl/server";

export default async function RoleSelectorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <BaseLayout showHeader={false} showFooter={false} >
      <RoleSelector />
    </BaseLayout>
  );
}

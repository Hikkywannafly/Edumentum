import { Settings } from "@/components/auth/settings"
import { BaseLayout } from "@/components/layout"
import { setRequestLocale } from "next-intl/server"

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <BaseLayout showHeader={false} showFooter={false}>
      <Settings />
    </BaseLayout>
  );
}

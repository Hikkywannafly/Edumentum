import { HeaderClient } from "@/components/header-client";
import { getTranslations } from "next-intl/server";

interface HeaderProps {
  title?: string;
}

export async function Header({ title }: HeaderProps) {
  const t = await getTranslations("Header");

  return <HeaderClient title={title || t("title")} />;
}

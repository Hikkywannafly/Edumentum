import { HeaderClient } from "@/components/header-client";
import { getTranslations } from 'next-intl/server';
import WideContainer from "./layout/wide-layout";

interface HeaderProps {
  title?: string;
}

export async function Header({ title }: HeaderProps) {
  const t = await getTranslations('Header');

  return (
    <WideContainer>
      <HeaderClient title={title || t('title')} />
    </WideContainer>
  );
}

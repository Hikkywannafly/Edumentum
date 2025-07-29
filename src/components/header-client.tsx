"use client";

import { useLocale } from 'next-intl';
import { HeaderServer } from './header-server';

interface HeaderClientProps {
  variant?: "default" | "admin";
  title?: string;
  showAuth?: boolean;
}

export function HeaderClient(props: HeaderClientProps) {
  const locale = useLocale();

  return <HeaderServer {...props} locale={locale} />;
}

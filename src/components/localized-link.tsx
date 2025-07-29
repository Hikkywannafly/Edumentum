"use client";

import { useLocale } from 'next-intl';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface LocalizedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function LocalizedLink({ href, children, className }: LocalizedLinkProps) {
  const locale = useLocale();
  const localizedHref = `/${locale}/${href}`;

  return (
    <Link href={localizedHref} className={className}>
      {children}
    </Link>
  );
}

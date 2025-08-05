"use client";

import { createLocalizedHref } from "@/lib/utils/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import type { ReactNode } from "react";

interface LocalizedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function LocalizedLink({
  href,
  children,
  className,
}: LocalizedLinkProps) {
  const locale = useLocale();
  const localizedHref = createLocalizedHref(href, locale);

  return (
    <Link href={localizedHref} className={className}>
      {children}
    </Link>
  );
}

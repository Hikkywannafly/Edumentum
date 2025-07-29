"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocalePersistence } from '@/hooks/use-locale-persistence';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useCallback, useTransition } from 'react';

const locales = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, saveLocale } = useLocalePersistence();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = useCallback((newLocale: string) => {
    saveLocale(newLocale);
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  }, [router, pathname, saveLocale]);

  return (
    <Select
      disabled={isPending}
      value={locale}
      onValueChange={handleLocaleChange}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            <span className="flex items-center gap-2">
              <span>{l.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

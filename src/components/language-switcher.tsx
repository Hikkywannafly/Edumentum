"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalePersistence } from '@/hooks/use-locale-persistence';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useCallback, useTransition } from 'react';

const locales = [
  {
    code: 'vi',
    label: 'Tiếng Việt',
    flag: '🇻🇳'
  },
  {
    code: 'en',
    label: 'English',
    flag: '🇺🇸'
  },
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

  const currentLocale = locales.find(l => l.code === locale);

  if (!currentLocale) {
    return (
      <Skeleton className="h-9 w-9 rounded-full" />
    );
  }

  return (
    <Select
      disabled={isPending}
      value={locale}
      onValueChange={handleLocaleChange}
    >
      <SelectTrigger className="h-9 w-9 rounded-full border-0 bg-transparent p-0 shadow-none ring-0 transition-colors hover:bg-muted/50 focus:ring-0 focus:ring-offset-0">
        <SelectValue>
          <span className="text-xl leading-none">{currentLocale.flag}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {locales.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            <div className="flex items-center gap-3">
              <span className="text-lg">{l.flag}</span>
              <span className="text-sm">{l.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

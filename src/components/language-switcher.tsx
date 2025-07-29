"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';

const locales = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [currentLocale, setCurrentLocale] = useState('vi');

  // Lấy locale hiện tại từ URL khi component mount
  useEffect(() => {
    const locale = window.location.pathname.split('/')[1] || 'vi';
    setCurrentLocale(locale);
  }, []);

  const handleLocaleChange = useCallback((locale: string) => {
    setCurrentLocale(locale);
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  }, [router, pathname]);

  return (
    <Select
      disabled={isPending}
      value={currentLocale}
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

import { setRequestLocale } from 'next-intl/server';
import { Header } from './header';

interface HeaderServerProps {
  variant?: "default" | "admin";
  title?: string;
  showAuth?: boolean;
  locale: string;
}

export async function HeaderServer(props: HeaderServerProps) {
  // Enable static rendering
  setRequestLocale(props.locale);

  return <Header {...props} />;
}

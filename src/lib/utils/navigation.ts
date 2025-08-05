import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

/**
 * Hook để xử lý navigation với locale support
 */
export function useLocalizedNavigation() {
  const router = useRouter();
  const locale = useLocale();

  /**
   * Navigate đến route với locale
   */
  const navigate = (path: string) => {
    const localizedPath = path.startsWith("/") ? path : `/${path}`;
    router.push(`/${locale}${localizedPath}`);
  };

  /**
   * Navigate đến route không có locale (absolute path)
   */
  const navigateAbsolute = (path: string) => {
    router.push(path);
  };

  /**
   * Navigate về trang trước đó
   */
  const goBack = () => {
    router.back();
  };

  /**
   * Navigate đến home page
   */
  const goHome = () => {
    navigate("/");
  };

  /**
   * Navigate đến dashboard
   */
  const goDashboard = () => {
    navigate("/dashboard");
  };

  /**
   * Navigate đến quizzes page
   */
  const goQuizzes = () => {
    navigate("/quizzes");
  };

  /**
   * Navigate đến login page
   */
  const goLogin = () => {
    navigate("/login");
  };

  return {
    navigate,
    navigateAbsolute,
    goBack,
    goHome,
    goDashboard,
    goQuizzes,
    goLogin,
    locale,
  };
}

/**
 * Utility function để tạo localized href
 */
export function createLocalizedHref(href: string, locale?: string): string {
  const currentLocale = locale || "en"; // fallback to 'en'
  const cleanHref = href.startsWith("/") ? href : `/${href}`;
  return `/${currentLocale}${cleanHref}`;
}

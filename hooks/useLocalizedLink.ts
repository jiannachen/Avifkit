import { useLocale } from 'next-intl';
import { getLocalizedRoute, type RouteKey, type Locale } from '@/i18n/config';

/**
 * Hook for generating localized links
 * @returns Function to get localized route
 */
export function useLocalizedLink() {
  const locale = useLocale() as Locale;

  /**
   * Get localized path for a given route
   * @param route - Route key (e.g., 'home', 'avif-to-jpg')
   * @returns Localized path
   */
  const getLink = (route: RouteKey): string => {
    return getLocalizedRoute(route, locale);
  };

  return { getLink };
}

import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Load and merge messages from different sources
  const messages = (await import(`./messages/${locale}.json`)).default;
  const legalMessages = (await import(`./legal/${locale}.json`)).default;

  return {
    locale,
    messages: {
      ...messages,
      legal: legalMessages
    }
  };
});

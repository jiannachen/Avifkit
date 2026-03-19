import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// Map page directory names to their keys in the global namespace
const PAGE_DIRS: Record<string, string> = {
  'avif-to-jpg': 'jpg',
  'avif-to-png': 'png',
  'avif-to-webp': 'webp',
  'png-to-avif': 'png-to-avif',
  'jpg-to-avif': 'jpg-to-avif',
  'webp-to-avif': 'webp-to-avif',
  'avif-to-gif': 'avif-to-gif',
  'avif-to-pdf': 'avif-to-pdf',
  'avif-viewer': 'avif-viewer',
};

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Load English as base messages (fallback for missing translations)
  const enMessages = (await import(`./messages/en.json`)).default;
  const enLegalMessages = (await import(`./legal/en.json`)).default;

  // Load locale-specific messages
  const localeMessages = locale !== 'en'
    ? (await import(`./messages/${locale}.json`)).default
    : enMessages;
  const legalMessages = locale !== 'en'
    ? (await import(`./legal/${locale}.json`)).default
    : enLegalMessages;

  // Load page translation files and map to global namespace
  const pageMessages: Record<string, any> = {
    pages: {},
    seo: {},
    schemas: { howto: {} },
  };

  for (const [dir, pageKey] of Object.entries(PAGE_DIRS)) {
    // Load en page translation as fallback
    const enPage = await loadPageJson(dir, 'en');

    // Load locale-specific page translation (falls back to en)
    const localePage = locale !== 'en' ? await loadPageJson(dir, locale) : enPage;
    const merged = deepMerge(enPage, localePage);

    // Put the entire page content under pages.{pageKey}
    // This allows page-scoped access: useTranslations(`pages.${pageKey}`)
    pageMessages.pages[pageKey] = merged;

    // Also map seo/schemas to top-level namespaces for backward compatibility
    if (merged.seo) {
      pageMessages.seo[pageKey] = merged.seo;
    }
    if (merged.schemas?.howto) {
      pageMessages.schemas.howto[pageKey] = merged.schemas.howto;
    }
  }

  // Deep merge: base → locale → page translations
  return {
    locale,
    messages: deepMerge(
      deepMerge(
        { ...enMessages, legal: enLegalMessages },
        { ...localeMessages, legal: legalMessages }
      ),
      pageMessages
    )
  };
});

async function loadPageJson(dir: string, locale: string): Promise<Record<string, any>> {
  try {
    return (await import(`./pages/${dir}/${locale}.json`)).default;
  } catch {
    return {};
  }
}

/**
 * Deep merge two objects. Values from `override` take precedence.
 */
function deepMerge(base: Record<string, any>, override: Record<string, any>): Record<string, any> {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      override[key] &&
      typeof override[key] === 'object' &&
      !Array.isArray(override[key]) &&
      base[key] &&
      typeof base[key] === 'object' &&
      !Array.isArray(base[key])
    ) {
      result[key] = deepMerge(base[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

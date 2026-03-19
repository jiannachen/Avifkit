import { MetadataRoute } from 'next';
import { i18n } from '@/i18n/config';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://avifkit.com';

// Get all blog post slugs from the blog directory
function getAllBlogSlugs(): string[] {
  try {
    const blogDir = path.join(process.cwd(), 'i18n', 'blog');
    const slugs = fs.readdirSync(blogDir);
    return slugs.filter(slug => {
      const slugPath = path.join(blogDir, slug);
      return fs.statSync(slugPath).isDirectory();
    });
  } catch (error) {
    console.error('Error reading blog directory:', error);
    return [];
  }
}

function buildUrl(locale: string, page: string): string {
  const isDefault = locale === i18n.defaultLocale;
  if (!page) return isDefault ? BASE_URL : `${BASE_URL}/${locale}`;
  return isDefault ? `${BASE_URL}/${page}` : `${BASE_URL}/${locale}/${page}`;
}

function buildAlternates(page: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of i18n.locales) {
    languages[locale] = buildUrl(locale, page);
  }
  languages['x-default'] = buildUrl(i18n.defaultLocale, page);
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Pages to include
  const pages = [
    '',
    'avif-to-jpg',
    'avif-to-png',
    'avif-to-webp',
    'png-to-avif',
    'jpg-to-avif',
    'webp-to-avif',
    'avif-to-gif',
    'avif-to-pdf',
    'avif-viewer',
    'blog',
    'privacy-policy',
    'terms'
  ];

  // Generate entries for all languages with alternates
  const staticPages = pages.flatMap((page) =>
    i18n.locales.map((locale) => ({
      url: buildUrl(locale, page),
      lastModified: new Date(),
      changeFrequency: page === 'blog' ? 'daily' as const :
                       page.includes('privacy') || page.includes('terms') ? 'monthly' as const :
                       'weekly' as const,
      priority: page === '' ? 1 :
                page.includes('avif-to') || page.includes('-to-avif') ? 0.9 :
                page === 'avif-viewer' ? 0.85 :
                page === 'blog' ? 0.8 :
                0.3,
      alternates: {
        languages: buildAlternates(page),
      },
    }))
  );

  // Add dynamic blog posts for all languages
  const blogSlugs = getAllBlogSlugs();
  const blogPosts = blogSlugs.flatMap(slug => {
    const blogPage = `blog/${slug}`;
    return i18n.locales.map(locale => ({
      url: buildUrl(locale, blogPage),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        languages: buildAlternates(blogPage),
      },
    }));
  });

  return [...staticPages, ...blogPosts];
}

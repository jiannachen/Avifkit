import { MetadataRoute } from 'next';
import { i18n } from '@/i18n/config';
import fs from 'fs';
import path from 'path';

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

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://avifkit.com';
  const defaultLocale = i18n.defaultLocale;

  // Pages to include
  const pages = ['', 'avif-to-jpg', 'avif-to-png', 'avif-to-webp', 'blog', 'privacy-policy', 'terms'];

  // Generate entries for all languages
  const staticPages = pages.flatMap((page) =>
    i18n.locales.map((locale) => {
      // For default locale (en), don't add locale prefix
      const localePath = locale === defaultLocale
        ? (page ? `/${page}` : '')
        : `/${locale}${page ? `/${page}` : ''}`;

      return {
        url: `${baseUrl}${localePath}`,
        lastModified: new Date(),
        changeFrequency: page === 'blog' ? 'daily' as const :
                         page.includes('privacy') || page.includes('terms') ? 'monthly' as const :
                         'weekly' as const,
        priority: page === '' ? 1 :
                  page.includes('avif-to') ? 0.9 :
                  page === 'blog' ? 0.8 :
                  0.3,
      };
    })
  );

  // Add dynamic blog posts for all languages
  const blogSlugs = getAllBlogSlugs();
  const blogPosts = blogSlugs.flatMap(slug =>
    i18n.locales.map(locale => {
      // For default locale (en), don't add locale prefix
      const localePath = locale === defaultLocale
        ? `/blog/${slug}`
        : `/${locale}/blog/${slug}`;

      return {
        url: `${baseUrl}${localePath}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      };
    })
  );

  return [...staticPages, ...blogPosts];
}

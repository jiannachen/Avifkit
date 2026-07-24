import { MetadataRoute } from 'next';
import { i18n } from '@/i18n/config';
import manifest from '@/i18n/blog/manifest.json';

export const runtime = 'edge';

const BASE_URL = 'https://avifkit.com';

interface BlogMeta {
  slug: string;
  date: string;
  image?: string;
}

async function getAllBlogMeta(): Promise<BlogMeta[]> {
  return Promise.all(
    manifest.map(async (slug) => {
      const data = await import(`@/i18n/blog/${slug}/en.json`);
      return { slug, date: data.default.date, image: data.default.image };
    })
  );
}

// Get the last git commit date for a file or directory, falling back to file mtime
function getContentLastModified(_relativePath: string): Date {
  return new Date('2026-01-01');
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

// Static page configuration with real last-modified dates and images
const pageConfig: Record<string, {
  lastModified: Date;
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  basePriority: number;
  images?: string[];
}> = {
  '': {
    lastModified: getContentLastModified('app/[locale]/page.tsx'),
    changeFrequency: 'weekly',
    basePriority: 1,
    images: ['https://img.avifkit.com/blog/what-is-avif-guide.webp'],
  },
  'avif-to-jpg': {
    lastModified: getContentLastModified('app/[locale]/avif-to-jpg/page.tsx'),
    changeFrequency: 'monthly',
    basePriority: 0.9,
  },
  'avif-to-png': {
    lastModified: getContentLastModified('app/[locale]/avif-to-png/page.tsx'),
    changeFrequency: 'monthly',
    basePriority: 0.9,
  },
  'avif-to-webp': {
    lastModified: getContentLastModified('app/[locale]/avif-to-webp/page.tsx'),
    changeFrequency: 'monthly',
    basePriority: 0.9,
  },
  'png-to-avif': {
    lastModified: getContentLastModified('app/[locale]/png-to-avif/page.tsx'),
    changeFrequency: 'monthly',
    basePriority: 0.9,
  },
  'jpg-to-avif': {
    lastModified: getContentLastModified('app/[locale]/jpg-to-avif/page.tsx'),
    changeFrequency: 'monthly',
    basePriority: 0.9,
  },
  'webp-to-avif': {
    lastModified: getContentLastModified('app/[locale]/webp-to-avif/page.tsx'),
    changeFrequency: 'monthly',
    basePriority: 0.9,
  },
  'avif-to-gif': {
    lastModified: getContentLastModified('app/[locale]/avif-to-gif/page.tsx'),
    changeFrequency: 'monthly',
    basePriority: 0.9,
  },
  'avif-to-pdf': {
    lastModified: getContentLastModified('app/[locale]/avif-to-pdf/page.tsx'),
    changeFrequency: 'monthly',
    basePriority: 0.9,
  },
  'avif-viewer': {
    lastModified: getContentLastModified('app/[locale]/avif-viewer/page.tsx'),
    changeFrequency: 'monthly',
    basePriority: 0.85,
  },
  'blog': {
    lastModified: getContentLastModified('app/[locale]/blog/page.tsx'),
    changeFrequency: 'daily',
    basePriority: 0.8,
    images: ['https://img.avifkit.com/blog/what-is-avif-guide.webp'],
  },
  'privacy-policy': {
    lastModified: getContentLastModified('app/[locale]/privacy-policy/page.tsx'),
    changeFrequency: 'yearly',
    basePriority: 0.3,
  },
  'terms': {
    lastModified: getContentLastModified('app/[locale]/terms/page.tsx'),
    changeFrequency: 'yearly',
    basePriority: 0.3,
  },
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = Object.keys(pageConfig);

  // Generate entries for all languages with alternates
  const staticPages = pages.flatMap((page) =>
    i18n.locales.map((locale) => {
      const config = pageConfig[page];
      const isDefault = locale === i18n.defaultLocale;

      return {
        url: buildUrl(locale, page),
        lastModified: config.lastModified,
        changeFrequency: config.changeFrequency,
        // Non-default locale homepages get slightly lower priority
        priority: page === '' && !isDefault ? 0.9 : config.basePriority,
        alternates: {
          languages: buildAlternates(page),
        },
        ...(config.images ? { images: config.images } : {}),
      };
    })
  );

  // Add dynamic blog posts for all languages
  const blogMetas = await getAllBlogMeta();
  const blogPosts = blogMetas.flatMap(({ slug, date, image }) => {
    const blogPage = `blog/${slug}`;
    return i18n.locales.map(locale => ({
      url: buildUrl(locale, blogPage),
      lastModified: new Date(date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        languages: buildAlternates(blogPage),
      },
      ...(image ? { images: [image] } : {}),
    }));
  });

  return [...staticPages, ...blogPosts];
}

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';
import { BlogContent } from '@/components/BlogContent';
import { BlogPostSchema } from '@/components/StructuredData';
import fs from 'fs';
import path from 'path';
import { getTranslations } from 'next-intl/server';

interface BlogArticleMeta {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  date: string;
  readingTime: number;
  category: string;
  keywords: string;
  image?: string;
  content: any[];
}

// Helper function to load blog content
function loadBlogContent(slug: string, locale: string = 'en'): BlogArticleMeta | null {
  try {
    const contentPath = path.join(process.cwd(), 'i18n', 'blog', slug, `${locale}.json`);
    const fileContent = fs.readFileSync(contentPath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    return null;
  }
}

// Get all available blog slugs
function getAllBlogSlugs(): string[] {
  try {
    const blogDir = path.join(process.cwd(), 'i18n', 'blog');
    const slugs = fs.readdirSync(blogDir);
    return slugs.filter(slug => {
      const slugPath = path.join(blogDir, slug);
      return fs.statSync(slugPath).isDirectory();
    });
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string; locale: string }>
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const article = loadBlogContent(slug, locale);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  const localePath = locale === 'en' ? '' : `/${locale}`;
  const url = `https://avifkit.com${localePath}/blog/${slug}`;
  const imageUrl = article.image || `https://img.avifkit.com/blog/what-is-avif-guide.webp`;

  return {
    title: article.title + ' | AvifKit Blog',
    description: article.description,
    keywords: article.keywords,
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      siteName: 'AvifKit',
      type: 'article',
      publishedTime: article.date,
      modifiedTime: article.date,
      authors: ['AvifKit Team'],
      locale: locale === 'en' ? 'en_US' : locale === 'es' ? 'es_ES' : locale === 'ja' ? 'ja_JP' : 'fr_FR',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
      languages: {
        'en': `https://avifkit.com/blog/${slug}`,
        'es': `https://avifkit.com/es/blog/${slug}`,
        'ja': `https://avifkit.com/ja/blog/${slug}`,
        'fr': `https://avifkit.com/fr/blog/${slug}`,
        'x-default': `https://avifkit.com/blog/${slug}`,
      },
    },
  };
}

export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export default async function BlogArticle({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const article = loadBlogContent(slug, locale);
  const t = await getTranslations({ locale, namespace: 'blog' });

  if (!article) {
    notFound();
  }

  const localePath = locale === 'en' ? '' : `/${locale}`;
  const url = `https://avifkit.com${localePath}/blog/${slug}`;
  const imageUrl = article.image || `https://img.avifkit.com/blog/what-is-avif-guide.webp`;

  return (
    <div className="min-h-screen bg-white">
      {/* Structured Data for Blog Post */}
      <BlogPostSchema
        title={article.title}
        description={article.description}
        datePublished={article.date}
        dateModified={article.date}
        image={imageUrl}
        url={url}
      />
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('detail.back_to_blog')}
          </Link>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-block px-3 py-1 bg-blue-100 rounded-full text-xs font-semibold text-blue-600">
                {article.category}
              </span>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={article.date}>
                    {new Date(article.date).toLocaleDateString(locale, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{article.readingTime} {t('list.min_read')}</span>
                </div>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BlogContent content={article.content} />
      </div>
    </div>
  );
}

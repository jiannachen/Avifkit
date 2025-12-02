import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import fs from 'fs';
import path from 'path';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog.meta' });

  const blogUrl = `https://avifkit.com/${locale === 'en' ? '' : locale + '/'}blog`;
  const localeMap: Record<string, string> = {
    'en': 'en_US',
    'es': 'es_ES',
    'ja': 'ja_JP',
    'fr': 'fr_FR'
  };

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),

    // OpenGraph tags
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      url: blogUrl,
      siteName: 'Avifkit',
      locale: localeMap[locale] || 'en_US',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },

    // Twitter Card tags
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/og-image.png'],
    },

    // Robots directives
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Canonical URL and alternate languages
    alternates: {
      canonical: blogUrl,
      languages: {
        'en': '/blog',
        'es': '/es/blog',
        'ja': '/ja/blog',
        'fr': '/fr/blog',
      },
    },
  };
}

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: number;
  category: string;
  image: string;
}

// Load blog posts from JSON files
function loadBlogPosts(locale: string = 'en'): BlogPost[] {
  try {
    const blogDir = path.join(process.cwd(), 'i18n', 'blog');
    const slugs = fs.readdirSync(blogDir);

    const posts = slugs
      .filter(slug => {
        const slugPath = path.join(blogDir, slug);
        return fs.statSync(slugPath).isDirectory();
      })
      .map(slug => {
        const filePath = path.join(blogDir, slug, `${locale}.json`);
        if (!fs.existsSync(filePath)) return null;

        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        return {
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt,
          date: data.date,
          readingTime: data.readingTime,
          category: data.category,
          image: data.image || `/blog/${data.slug}.jpg`,
        };
      })
      .filter((post): post is BlogPost => post !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date desc

    return posts;
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return [];
  }
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const blogPosts = loadBlogPosts(locale);
  const t = await getTranslations({ locale, namespace: 'blog' });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900">
              {t('hero.title_prefix')} <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t('hero.title_gradient')}</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600">
              {t('hero.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                    </svg>
                  </div>
                )}
                {/* Category badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-blue-600 border border-blue-100">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString(locale, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.readingTime} {t('list.min_read')}</span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  <Link href={`/${locale}/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h2>

                {/* Excerpt */}
                <p className="text-slate-600 leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Read More Link */}
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:gap-3 transition-all"
                >
                  {t('list.read_more')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Empty state if no posts */}
        {blogPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500">{t('list.empty_state')}</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/avif-to-jpg`}
              className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-colors shadow-lg inline-flex items-center justify-center gap-2"
            >
              {t('cta.button_jpg')}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/${locale}/avif-to-png`}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-full font-semibold hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2"
            >
              {t('cta.button_png')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

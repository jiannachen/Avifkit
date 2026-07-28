import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const defaultLocaleRoutes = [
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
  'terms',
];

export default function config(phase: string) {
  const isDevelopment = phase === PHASE_DEVELOPMENT_SERVER;

  const nextConfig: NextConfig = {
    // Cloudflare Pages serves the static export in production. During `next dev`,
    // use Next's request router so prefixless English URLs can be rewritten below.
    ...(!isDevelopment && { output: 'export' as const }),
    distDir: isDevelopment ? '.next-dev' : '.next',
    outputFileTracingRoot: process.cwd(),
    reactStrictMode: true,
    images: {
      unoptimized: true,
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'img.avifkit.com',
        },
      ],
    },
    ...(isDevelopment && {
      async redirects() {
        return [
          { source: '/en', destination: '/', permanent: true },
          { source: '/en/:path+', destination: '/:path+', permanent: true },
        ];
      },
      async rewrites() {
        return {
          beforeFiles: [
            { source: '/favicon.ico', destination: '/icon.svg' },
            { source: '/', destination: '/en' },
            ...defaultLocaleRoutes.map((route) => ({
              source: `/${route}`,
              destination: `/en/${route}`,
            })),
            { source: '/blog/:slug', destination: '/en/blog/:slug' },
          ],
          afterFiles: [],
          fallback: [],
        };
      },
    }),
  };

  return withNextIntl(nextConfig);
}

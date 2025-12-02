import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 确保静态导出支持(如果需要)
  // output: 'export',
};

export default withNextIntl(nextConfig);

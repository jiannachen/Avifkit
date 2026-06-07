import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const locales = ['en', 'ja', 'es', 'fr'];
const defaultLocale = 'en';
const toolRoutes = [
  'avif-to-jpg',
  'avif-to-png',
  'avif-to-webp',
  'png-to-avif',
  'jpg-to-avif',
  'webp-to-avif',
  'avif-to-gif',
  'avif-to-pdf',
  'avif-viewer',
];
const staticRoutes = ['', ...toolRoutes, 'blog', 'privacy-policy', 'terms'];
const sitemapPath = path.join(root, 'app', 'sitemap.ts');
const blogRoot = path.join(root, 'i18n', 'blog');

const errors = [];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function canonicalPath(locale, route) {
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  return route ? `${prefix}/${route}` : prefix || '/';
}

function assert(condition, message) {
  if (!condition) errors.push(message);
}

for (const route of staticRoutes) {
  const pageFile = route
    ? `app/[locale]/${route}/page.tsx`
    : 'app/[locale]/page.tsx';
  assert(exists(pageFile), `Missing page file for route "${route || '/'}": ${pageFile}`);
}

for (const route of toolRoutes) {
  for (const locale of locales) {
    assert(
      exists(`i18n/pages/${route}/${locale}.json`),
      `Missing page translation: i18n/pages/${route}/${locale}.json`
    );
  }
}

const sitemap = read('app/sitemap.ts');
for (const route of staticRoutes) {
  if (route) {
    assert(sitemap.includes(`'${route}'`), `Sitemap pageConfig is missing route "${route}"`);
  }
}

const blogSlugs = fs
  .readdirSync(blogRoot)
  .filter((slug) => fs.statSync(path.join(blogRoot, slug)).isDirectory());

for (const slug of blogSlugs) {
  assert(sitemap.includes(`blog/${slug}`) || sitemap.includes('getAllBlogMeta'), `Sitemap may miss blog slug "${slug}"`);
  for (const locale of locales) {
    const relativePath = `i18n/blog/${slug}/${locale}.json`;
    assert(exists(relativePath), `Missing blog translation: ${relativePath}`);
    if (exists(relativePath)) {
      const data = JSON.parse(read(relativePath));
      assert(data.slug === slug, `Blog slug mismatch in ${relativePath}: expected "${slug}", got "${data.slug}"`);
      assert(data.title && data.description, `Blog metadata is incomplete in ${relativePath}`);
      assert(data.date && !Number.isNaN(Date.parse(data.date)), `Blog date is invalid in ${relativePath}`);
    }
  }
}

const filesToScan = [
  ...fs.readdirSync(path.join(root, 'app', '[locale]', 'blog')).map((entry) => `app/[locale]/blog/${entry}`),
  'components/BlogContent.tsx',
  'components/LandingPageTemplate.tsx',
].filter((relativePath) => {
  const fullPath = path.join(root, relativePath);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isFile();
});

for (const relativePath of filesToScan) {
  const content = read(relativePath);
  assert(
    !content.includes('href={`/${locale}/'),
    `Hard-coded default-locale-prefixed link found in ${relativePath}`
  );
}

for (const route of staticRoutes) {
  for (const locale of locales) {
    const urlPath = canonicalPath(locale, route);
    assert(urlPath !== '/en' && !urlPath.startsWith('/en/'), `Canonical path should not include /en: ${urlPath}`);
  }
}

if (errors.length > 0) {
  console.error('SEO audit failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`SEO audit passed for ${staticRoutes.length} static routes, ${blogSlugs.length} blog posts, and ${locales.length} locales.`);

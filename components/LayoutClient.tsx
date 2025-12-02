'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Globe, ChevronDown, X, ShieldCheck } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { type Locale } from '@/i18n/config';

export const LayoutClient: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const { getLink } = useLocalizedLink();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const changeLang = (lang: Locale) => {
    setIsLangMenuOpen(false);
    setIsMobileMenuOpen(false);

    // Store language preference in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }

    // Use next-intl router to navigate with proper locale handling
    // pathname is already without locale prefix from next-intl's usePathname
    router.replace(pathname, { locale: lang });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white selection:bg-blue-100">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href={getLink('home')} className="flex items-center gap-2 group" onClick={closeMobileMenu}>
                <Image
                  src="/logo.svg"
                  alt="Avifkit Logo"
                  width={32}
                  height={32}
                  className="group-hover:opacity-80 transition-opacity"
                  priority
                />
                <span className="font-bold text-xl tracking-tight text-slate-900">Avifkit</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              {/* Tools Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setIsToolsMenuOpen(true)}
                  onMouseLeave={() => setIsToolsMenuOpen(false)}
                  className="flex items-center text-sm font-medium text-slate-600 hover:text-blue-600 py-2 transition-colors"
                >
                  {t('nav.tools')} <ChevronDown className="ml-1 w-4 h-4" />
                </button>

                {isToolsMenuOpen && (
                   <div
                   onMouseEnter={() => setIsToolsMenuOpen(true)}
                   onMouseLeave={() => setIsToolsMenuOpen(false)}
                   className="absolute top-full left-0 w-56 pt-2"
                 >
                    <div className="bg-white rounded-lg shadow-xl border border-slate-100 p-2">
                      <Link href={getLink('avif-to-jpg')} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md">AVIF to JPG</Link>
                      <Link href={getLink('avif-to-webp')} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md bg-blue-50/50 font-medium text-blue-700">AVIF to WebP <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-1">Hot</span></Link>
                      <Link href={getLink('avif-to-png')} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md">AVIF to PNG</Link>
                    </div>
                  </div>
                )}
              </div>

              <Link href={getLink('blog')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">{t('nav.blog')}</Link>

              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center gap-1 text-slate-600 hover:text-black transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase">{locale}</span>
                </button>
                {isLangMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-slate-100 py-1">
                     <button onClick={() => changeLang('en')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${locale === 'en' ? 'text-blue-600 font-bold' : 'text-slate-700'}`}>English</button>
                     <button onClick={() => changeLang('ja')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${locale === 'ja' ? 'text-blue-600 font-bold' : 'text-slate-700'}`}>日本語</button>
                     <button onClick={() => changeLang('es')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${locale === 'es' ? 'text-blue-600 font-bold' : 'text-slate-700'}`}>Español</button>
                     <button onClick={() => changeLang('fr')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${locale === 'fr' ? 'text-blue-600 font-bold' : 'text-slate-700'}`}>Français</button>
                  </div>
                )}
              </div>

              {/* CTA */}
              <a
                href="#converter"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-full text-sm font-medium text-white bg-black hover:bg-slate-800 transition-all shadow-sm"
              >
                {t('nav.convert_now')}
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button onClick={toggleMobileMenu} className="text-slate-600">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200">
            <div className="px-4 pt-2 pb-6 space-y-1">
              <Link href={getLink('avif-to-jpg')} onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">AVIF to JPG</Link>
              <Link href={getLink('avif-to-png')} onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">AVIF to PNG</Link>
              <Link href={getLink('avif-to-webp')} onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">AVIF to WebP</Link>
              <div className="h-px bg-slate-100 my-2"></div>
              <div className="flex gap-4 px-3 py-2">
                <button onClick={() => changeLang('en')} className={`text-sm font-bold ${locale === 'en' ? 'text-blue-600' : 'text-slate-500'}`}>EN</button>
                <button onClick={() => changeLang('ja')} className={`text-sm font-bold ${locale === 'ja' ? 'text-blue-600' : 'text-slate-500'}`}>JA</button>
                <button onClick={() => changeLang('es')} className={`text-sm font-bold ${locale === 'es' ? 'text-blue-600' : 'text-slate-500'}`}>ES</button>
                <button onClick={() => changeLang('fr')} className={`text-sm font-bold ${locale === 'fr' ? 'text-blue-600' : 'text-slate-500'}`}>FR</button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white font-bold text-xs">
                  A
                </div>
                <span className="font-bold text-lg text-slate-900">Avifkit</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t('footer.slogan')}
              </p>
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('hero.privacy_banner').split(':')[0]}</span>
              </div>
            </div>

            {/* Tools & Resources */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">{t('footer.headers.tools')}</h3>
              <ul className="space-y-3">
                <li><Link href={getLink('avif-to-webp')} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">AVIF to WebP</Link></li>
                <li><Link href={getLink('avif-to-png')} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">AVIF to PNG</Link></li>
                <li><Link href={getLink('avif-to-jpg')} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">AVIF to JPG</Link></li>
                <li><Link href={getLink('blog')} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">{t('footer.links.blog')}</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">{t('footer.headers.legal')}</h3>
              <ul className="space-y-3">
                <li><Link href={getLink('privacy-policy')} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">{t('footer.links.privacy')}</Link></li>
                <li><Link href={getLink('terms')} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">{t('footer.links.terms')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

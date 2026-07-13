'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Globe, ChevronDown, X, ShieldCheck, Mail } from 'lucide-react';
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
  const converterHref = pathname.includes('/blog') || pathname.includes('/privacy-policy') || pathname.includes('/terms') || pathname.includes('/avif-viewer')
    ? `${getLink('avif-to-jpg')}#converter`
    : '#converter';

  const toolsRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setIsToolsMenuOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const changeLang = (lang: Locale) => {
    setIsLangMenuOpen(false);
    setIsMobileMenuOpen(false);

    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }

    router.replace(pathname, { locale: lang });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#fafafa] selection:bg-blue-100">
      <header className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-6">
        <div className="mx-auto max-w-[1120px] rounded-xl border border-slate-200 bg-white/95 px-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-md sm:px-5">
          <div className="flex h-14 items-center justify-between">

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href={getLink('avif-to-jpg')} className="flex items-center gap-2 group" onClick={closeMobileMenu}>
                <Image
                  src="/logo.svg"
                  alt="Avifkit Logo"
                  width={32}
                  height={32}
                  className="group-hover:opacity-80 transition-opacity"
                  priority
                />
                <span className="font-display text-xl font-semibold text-slate-950">Avifkit</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-6 md:flex" aria-label="Primary navigation">
              {/* Tools Dropdown */}
              <div className="relative" ref={toolsRef}>
                <button
                  onClick={() => { setIsToolsMenuOpen(!isToolsMenuOpen); setIsLangMenuOpen(false); }}
                  aria-expanded={isToolsMenuOpen}
                  aria-controls="desktop-tools-menu"
                  className={`flex min-h-11 items-center text-sm font-medium transition-colors ${isToolsMenuOpen ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'}`}
                >
                  {t('nav.tools')} <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${isToolsMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isToolsMenuOpen && (
                  <div id="desktop-tools-menu" className="absolute left-0 top-full w-64 pt-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-md">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-1">{t('nav.avif_to_others')}</div>
                      <Link href={getLink('avif-to-jpg')} onClick={() => setIsToolsMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md">AVIF to JPG</Link>
                      <Link href={getLink('avif-to-png')} onClick={() => setIsToolsMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md">AVIF to PNG</Link>
                      <Link href={getLink('avif-to-webp')} onClick={() => setIsToolsMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md bg-blue-50/50 font-medium text-blue-700">AVIF to WebP <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-1">Hot</span></Link>
                      <Link href={getLink('avif-to-gif')} onClick={() => setIsToolsMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md">AVIF to GIF</Link>
                      <Link href={getLink('avif-to-pdf')} onClick={() => setIsToolsMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md">AVIF to PDF</Link>
                      <div className="h-px bg-slate-100 my-1"></div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-1">{t('nav.others_to_avif')}</div>
                      <Link href={getLink('jpg-to-avif')} onClick={() => setIsToolsMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md">JPG to AVIF</Link>
                      <Link href={getLink('png-to-avif')} onClick={() => setIsToolsMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md">PNG to AVIF</Link>
                      <Link href={getLink('webp-to-avif')} onClick={() => setIsToolsMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md">WebP to AVIF</Link>
                      <div className="h-px bg-slate-100 my-1"></div>
                      <Link href={getLink('avif-viewer')} onClick={() => setIsToolsMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md">{t('nav.viewer')}</Link>
                    </div>
                  </div>
                )}
              </div>

              <Link href={getLink('blog')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">{t('nav.blog')}</Link>

              {/* Language Switcher */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => { setIsLangMenuOpen(!isLangMenuOpen); setIsToolsMenuOpen(false); }}
                  aria-expanded={isLangMenuOpen}
                  aria-controls="desktop-language-menu"
                  aria-label={`Language: ${locale}`}
                  className={`flex min-h-11 items-center gap-1 transition-colors ${isLangMenuOpen ? 'text-blue-600' : 'text-slate-700 hover:text-black'}`}
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase">{locale}</span>
                </button>
                {isLangMenuOpen && (
                  <div id="desktop-language-menu" className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-slate-200 bg-white py-1 shadow-md">
                     <button onClick={() => changeLang('en')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${locale === 'en' ? 'text-blue-600 font-bold' : 'text-slate-700'}`}>English</button>
                     <button onClick={() => changeLang('ja')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${locale === 'ja' ? 'text-blue-600 font-bold' : 'text-slate-700'}`}>日本語</button>
                     <button onClick={() => changeLang('es')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${locale === 'es' ? 'text-blue-600 font-bold' : 'text-slate-700'}`}>Español</button>
                     <button onClick={() => changeLang('fr')} className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${locale === 'fr' ? 'text-blue-600 font-bold' : 'text-slate-700'}`}>Français</button>
                  </div>
                )}
              </div>

              {/* CTA */}
              <a
                href={converterHref}
                className="btn-primary"
              >
                {t('nav.convert_now')}
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="icon-button border-0"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div id="mobile-navigation" className={`overflow-hidden md:hidden ${isMobileMenuOpen ? 'max-h-[calc(100dvh-88px)] overflow-y-auto border-t border-slate-200 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="space-y-1 px-3 pb-5 pt-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">{t('nav.avif_to_others')}</div>
            <Link href={getLink('avif-to-jpg')} onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">AVIF to JPG</Link>
            <Link href={getLink('avif-to-png')} onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">AVIF to PNG</Link>
            <Link href={getLink('avif-to-webp')} onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">AVIF to WebP</Link>
            <Link href={getLink('avif-to-gif')} onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">AVIF to GIF</Link>
            <Link href={getLink('avif-to-pdf')} onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">AVIF to PDF</Link>
            <div className="h-px bg-slate-100 my-2"></div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">{t('nav.others_to_avif')}</div>
            <Link href={getLink('jpg-to-avif')} onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">JPG to AVIF</Link>
            <Link href={getLink('png-to-avif')} onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">PNG to AVIF</Link>
            <Link href={getLink('webp-to-avif')} onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">WebP to AVIF</Link>
            <div className="h-px bg-slate-100 my-2"></div>
            <Link href={getLink('avif-viewer')} onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">{t('nav.viewer')}</Link>
            <div className="h-px bg-slate-100 my-2"></div>
            <div className="flex gap-4 px-3 py-2">
              <button onClick={() => changeLang('en')} className={`text-sm font-bold ${locale === 'en' ? 'text-blue-600' : 'text-slate-500'}`}>EN</button>
              <button onClick={() => changeLang('ja')} className={`text-sm font-bold ${locale === 'ja' ? 'text-blue-600' : 'text-slate-500'}`}>JA</button>
              <button onClick={() => changeLang('es')} className={`text-sm font-bold ${locale === 'es' ? 'text-blue-600' : 'text-slate-500'}`}>ES</button>
              <button onClick={() => changeLang('fr')} className={`text-sm font-bold ${locale === 'fr' ? 'text-blue-600' : 'text-slate-500'}`}>FR</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 pb-8 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.svg"
                  alt="Avifkit Logo"
                  width={24}
                  height={24}
                />
                <span className="font-display text-xl font-semibold text-slate-950">Avifkit</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t('footer.slogan')}
              </p>
              <div className="flex items-center gap-2 text-slate-700 text-sm font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('footer.privacy_badge')}</span>
              </div>
            </div>

            {/* AVIF to Others */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">{t('nav.avif_to_others')}</h3>
              <ul className="space-y-3">
                <li><Link href={getLink('avif-to-jpg')} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">AVIF to JPG</Link></li>
                <li><Link href={getLink('avif-to-png')} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">AVIF to PNG</Link></li>
                <li><Link href={getLink('avif-to-webp')} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">AVIF to WebP</Link></li>
                <li><Link href={getLink('avif-to-gif')} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">AVIF to GIF</Link></li>
                <li><Link href={getLink('avif-to-pdf')} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">AVIF to PDF</Link></li>
                <li><Link href={getLink('avif-viewer')} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">{t('nav.viewer')}</Link></li>
              </ul>
            </div>

            {/* Others to AVIF & Resources */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">{t('nav.others_to_avif')}</h3>
              <ul className="space-y-3">
                <li><Link href={getLink('jpg-to-avif')} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">JPG to AVIF</Link></li>
                <li><Link href={getLink('png-to-avif')} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">PNG to AVIF</Link></li>
                <li><Link href={getLink('webp-to-avif')} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">WebP to AVIF</Link></li>
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
            <a href="mailto:support@avifkit.com" className="text-sm text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              support@avifkit.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

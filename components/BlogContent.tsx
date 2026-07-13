import React from 'react';
import Link from 'next/link';

interface ContentBlock {
  type: string;
  text?: string;
  items?: string[] | Array<{question: string; answer: string}>;
  title?: string;
  subtitle?: string;
  button?: {text: string; link: string};
  headers?: string[];
  rows?: string[][];
}

function localizePath(path: string, locale: string) {
  if (
    locale === 'en' ||
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('#') ||
    /^\/(en|ja|es|fr)(\/|$)/.test(path)
  ) {
    return path;
  }

  return path.startsWith('/') ? `/${locale}${path}` : path;
}

// Parse link syntax {link:/path|Text} and convert to Link component
function parseTextWithLinks(text: string, locale: string) {
  const parts = text.split(/(\{link:[^}]+\})/g);

  return parts.map((part, index) => {
    const linkMatch = part.match(/\{link:([^|]+)\|([^}]+)\}/);
    if (linkMatch) {
      const [, path, linkText] = linkMatch;
      return (
        <Link
          key={index}
          href={localizePath(path, locale)}
          className="text-blue-600 hover:underline font-semibold"
        >
          {linkText}
        </Link>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function BlogContent({ content, locale }: { content: ContentBlock[]; locale: string }) {
  return (
    <article className="prose prose-lg max-w-none">
      {content.map((block, index) => {
        switch (block.type) {
          case 'lead':
            return (
              <p key={index} className="lead text-xl text-slate-700 leading-relaxed">
                {block.text}
              </p>
            );

          case 'h2':
            return (
              <h2 key={index} className="mb-4 mt-14 text-3xl font-semibold text-slate-950">
                {block.text}
              </h2>
            );

          case 'h3':
            return (
              <h3 key={index} className="text-xl font-semibold text-slate-800 mt-8 mb-3">
                {block.text}
              </h3>
            );

          case 'p':
            return (
              <p key={index} className="text-slate-700 leading-relaxed my-4">
                {parseTextWithLinks(block.text || '', locale)}
              </p>
            );

          case 'ul':
            return (
              <ul key={index} className="list-disc list-inside space-y-2 my-4 text-slate-700">
                {(block.items as string[])?.map((item, i) => (
                  <li key={i}>{parseTextWithLinks(item, locale)}</li>
                ))}
              </ul>
            );

          case 'ol':
            return (
              <ol key={index} className="list-decimal list-inside space-y-2 my-4 text-slate-700">
                {(block.items as string[])?.map((item, i) => (
                  <li key={i}>{parseTextWithLinks(item, locale)}</li>
                ))}
              </ol>
            );

          case 'tip':
            return (
              <div key={index} className="my-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
                <p className="font-semibold text-blue-900 mb-2">{block.title}</p>
                <p className="text-blue-800 mb-0">{block.text}</p>
              </div>
            );

          case 'faq':
            return (
              <div key={index} className="space-y-6 my-8">
                {(block.items as Array<{question: string; answer: string}>)?.map((faq, i) => (
                  <div key={i} className="border-l-2 border-slate-200 pl-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.question}</h3>
                    <p className="text-slate-700">{parseTextWithLinks(faq.answer, locale)}</p>
                  </div>
                ))}
              </div>
            );

          case 'table':
            return (
              <div key={index} className="overflow-x-auto my-8">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border border-slate-200">
                  {block.headers && (
                    <thead>
                      <tr className="border-b border-slate-200 bg-blue-50 text-slate-950">
                        {block.headers.map((header, i) => (
                          <th key={i} className="px-4 py-3 text-left text-sm font-semibold">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  {block.rows && (
                    <tbody>
                      {block.rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className={`px-4 py-3 text-sm border-t border-slate-100 ${cellIdx === 0 ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                              {parseTextWithLinks(cell, locale)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
              </div>
            );

          case 'cta':
            return (
              <div key={index} className="my-12 rounded-2xl border border-blue-200 bg-blue-50 p-8 text-slate-950">
                <h3 className="mb-3 text-2xl font-semibold text-slate-950">{block.title}</h3>
                <p className="mb-6 text-slate-700">{block.subtitle}</p>
                <Link
                  href={block.button?.link ? localizePath(block.button.link, locale) : '/'}
                  className="btn-primary px-6"
                >
                  {block.button?.text}
                </Link>
              </div>
            );

          default:
            return null;
        }
      })}
    </article>
  );
}

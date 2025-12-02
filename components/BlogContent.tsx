import React from 'react';
import Link from 'next/link';

interface ContentBlock {
  type: string;
  text?: string;
  items?: string[] | Array<{question: string; answer: string}>;
  title?: string;
  subtitle?: string;
  button?: {text: string; link: string};
}

// Parse link syntax {link:/path|Text} and convert to Link component
function parseTextWithLinks(text: string) {
  const parts = text.split(/(\{link:[^}]+\})/g);

  return parts.map((part, index) => {
    const linkMatch = part.match(/\{link:([^|]+)\|([^}]+)\}/);
    if (linkMatch) {
      const [, path, linkText] = linkMatch;
      return (
        <Link
          key={index}
          href={path}
          className="text-blue-600 hover:underline font-semibold"
        >
          {linkText}
        </Link>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function BlogContent({ content }: { content: ContentBlock[] }) {
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
              <h2 key={index} className="text-2xl font-bold text-slate-900 mt-12 mb-4">
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
                {parseTextWithLinks(block.text || '')}
              </p>
            );

          case 'ul':
            return (
              <ul key={index} className="list-disc list-inside space-y-2 my-4 text-slate-700">
                {(block.items as string[])?.map((item, i) => (
                  <li key={i}>{parseTextWithLinks(item)}</li>
                ))}
              </ul>
            );

          case 'ol':
            return (
              <ol key={index} className="list-decimal list-inside space-y-2 my-4 text-slate-700">
                {(block.items as string[])?.map((item, i) => (
                  <li key={i}>{parseTextWithLinks(item)}</li>
                ))}
              </ol>
            );

          case 'tip':
            return (
              <div key={index} className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8 rounded-r-lg">
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
                    <p className="text-slate-700">{parseTextWithLinks(faq.answer)}</p>
                  </div>
                ))}
              </div>
            );

          case 'cta':
            return (
              <div key={index} className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white my-12">
                <h3 className="text-2xl font-bold mb-3 text-white">{block.title}</h3>
                <p className="mb-6 text-blue-100">{block.subtitle}</p>
                <Link
                  href={block.button?.link || '/'}
                  className="inline-block px-6 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-colors"
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

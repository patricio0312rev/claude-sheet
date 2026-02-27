import { useState } from 'react';

interface TocHeading {
  slug: string;
  text: string;
}

interface MobileTocProps {
  headings: TocHeading[];
}

export default function MobileToc({ headings }: MobileTocProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = (slug: string) => {
    setIsOpen(false);
    const el = document.getElementById(slug);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <>
      {/* Floating button — mobile only */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer"
        style={{
          backgroundColor: 'var(--color-terminal-surface)',
          border: '1px solid var(--color-terminal-border)',
          color: 'var(--color-terminal-green)',
        }}
        type="button"
        aria-label="Open table of contents"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="2" y1="4" x2="14" y2="4" />
          <line x1="2" y1="8" x2="14" y2="8" />
          <line x1="2" y1="12" x2="10" y2="12" />
        </svg>
        Contents
      </button>

      {/* Full-screen overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: 'var(--color-terminal-bg)' }}>
          <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'var(--color-terminal-border)' }}>
            <h2 className="text-sm uppercase tracking-wider" style={{ color: 'var(--color-terminal-text-dim)' }}>
              Contents
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="px-2 py-1 text-sm rounded cursor-pointer"
              style={{
                color: 'var(--color-terminal-text-dim)',
                border: '1px solid var(--color-terminal-border)',
              }}
              type="button"
              aria-label="Close table of contents"
            >
              ESC
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="space-y-1">
              {headings.map((heading) => (
                <li key={heading.slug}>
                  <button
                    onClick={() => handleLinkClick(heading.slug)}
                    className="block w-full text-left py-2 px-3 rounded text-sm transition-colors cursor-pointer hover:bg-[var(--color-terminal-surface)]"
                    style={{ color: 'var(--color-terminal-text-dim)' }}
                    type="button"
                  >
                    {heading.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}

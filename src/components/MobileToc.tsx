import { useState, useEffect, useRef } from 'react';

interface TocHeading {
  slug: string;
  text: string;
}

interface MobileTocProps {
  headings: TocHeading[];
}

export default function MobileToc({ headings }: MobileTocProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleLinkClick = (slug: string) => {
    setIsOpen(false);
    const el = document.getElementById(slug);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(13, 20, 32, 0.85)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-accent)',
        }}
        type="button"
        aria-label="Open table of contents"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="15" y2="18" />
        </svg>
        Contents
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: 'var(--color-bg)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Table of contents"
        >
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <h2 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              On this page
            </h2>
            <button
              ref={closeButtonRef}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer"
              style={{
                color: 'var(--color-text-muted)',
                backgroundColor: 'var(--color-surface)',
              }}
              type="button"
              aria-label="Close table of contents"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="space-y-0.5">
              {headings.map((heading) => (
                <li key={heading.slug}>
                  <a
                    href={`#${heading.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(heading.slug);
                    }}
                    className="block py-2.5 px-4 rounded-lg text-sm transition-colors cursor-pointer"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                      e.currentTarget.style.color = 'var(--color-text)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}

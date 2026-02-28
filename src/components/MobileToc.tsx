import { useState, useEffect, useRef, useCallback } from 'react';

interface TocHeading {
  slug: string;
  text: string;
}

interface MobileTocProps {
  headings: TocHeading[];
}

export default function MobileToc({ headings }: MobileTocProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSheetMode, setIsSheetMode] = useState(false);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Listen for sheet mode changes
  useEffect(() => {
    setIsSheetMode(document.documentElement.getAttribute('data-view-mode') === 'sheet');
    const handler = () => setIsSheetMode(document.documentElement.getAttribute('data-view-mode') === 'sheet');
    window.addEventListener('view-mode-changed', handler);
    return () => window.removeEventListener('view-mode-changed', handler);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      triggerButtonRef.current?.focus();
    };
  }, [isOpen, handleClose]);

  const handleLinkClick = (slug: string) => {
    handleClose();
    const el = document.getElementById(slug);
    if (el) {
      setTimeout(() => {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }, 100);
    }
  };

  if (isSheetMode) return null;

  return (
    <>
      <button
        ref={triggerButtonRef}
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-2.5 text-sm font-medium cursor-pointer bg-accent text-bg shadow-lg shadow-accent/20"
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
          ref={dialogRef}
          className="lg:hidden fixed inset-0 z-50 flex flex-col bg-bg text-text"
          role="dialog"
          aria-modal="true"
          aria-label="Table of contents"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-heading text-lg font-bold text-text">
              Contents
            </h2>
            <button
              ref={closeButtonRef}
              onClick={handleClose}
              className="flex items-center justify-center w-8 h-8 rounded cursor-pointer text-text-muted bg-surface"
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
                    className="block py-2 px-3 rounded text-sm text-text-secondary transition-colors cursor-pointer hover:bg-surface hover:text-text"
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

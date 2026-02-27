import { useEffect, useState } from 'react';

export default function KeyboardNav() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused()) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const headings = Array.from(document.querySelectorAll('#sheet-content h2'));
      if (headings.length === 0) return;

      if (e.key === 'j' || e.key === 'k') {
        e.preventDefault();
        const scrollY = window.scrollY + 100;
        let currentIndex = -1;

        headings.forEach((h, i) => {
          if ((h as HTMLElement).offsetTop <= scrollY) {
            currentIndex = i;
          }
        });

        const nextIndex =
          e.key === 'j'
            ? Math.min(currentIndex + 1, headings.length - 1)
            : Math.max(currentIndex - 1, 0);

        headings[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 7000);
    const hideTimer = setTimeout(() => setVisible(false), 8000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 right-4 hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs backdrop-blur-md z-50"
      style={{
        backgroundColor: 'rgba(13, 20, 32, 0.85)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-muted)',
        opacity: fading ? 0 : 1,
        transition: 'opacity 1s ease',
      }}
    >
      <span className="flex items-center gap-1">
        <kbd
          className="inline-flex items-center justify-center w-5 h-5 rounded text-[0.625rem] font-mono"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            color: 'var(--color-accent)',
            border: '1px solid var(--color-border)',
          }}
        >
          j
        </kbd>
        <kbd
          className="inline-flex items-center justify-center w-5 h-5 rounded text-[0.625rem] font-mono"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            color: 'var(--color-accent)',
            border: '1px solid var(--color-border)',
          }}
        >
          k
        </kbd>
        <span className="ml-0.5">navigate</span>
      </span>
      <span style={{ color: 'var(--color-border-bright)' }}>·</span>
      <span className="flex items-center gap-1">
        <kbd
          className="inline-flex items-center justify-center w-5 h-5 rounded text-[0.625rem] font-mono"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            color: 'var(--color-accent)',
            border: '1px solid var(--color-border)',
          }}
        >
          /
        </kbd>
        <span className="ml-0.5">search</span>
      </span>
    </div>
  );
}

function isInputFocused(): boolean {
  const tag = document.activeElement?.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select';
}

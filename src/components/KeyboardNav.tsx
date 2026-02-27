import { useEffect, useState } from 'react';

export default function KeyboardNav() {
  const [visible, setVisible] = useState(true);

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

  // Hide hint after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 right-4 hidden lg:flex items-center gap-3 px-3 py-2 rounded text-xs z-50 transition-opacity"
      style={{
        backgroundColor: 'var(--color-terminal-surface)',
        borderColor: 'var(--color-terminal-border)',
        border: '1px solid var(--color-terminal-border)',
        color: 'var(--color-terminal-text-dim)',
      }}
    >
      <span>
        <kbd
          className="px-1 rounded"
          style={{
            backgroundColor: 'var(--color-terminal-bg)',
            color: 'var(--color-terminal-green)',
          }}
        >
          j
        </kbd>
        /
        <kbd
          className="px-1 rounded"
          style={{
            backgroundColor: 'var(--color-terminal-bg)',
            color: 'var(--color-terminal-green)',
          }}
        >
          k
        </kbd>{' '}
        navigate
      </span>
      <span>·</span>
      <span>
        <kbd
          className="px-1 rounded"
          style={{
            backgroundColor: 'var(--color-terminal-bg)',
            color: 'var(--color-terminal-green)',
          }}
        >
          /
        </kbd>{' '}
        search
      </span>
    </div>
  );
}

function isInputFocused(): boolean {
  const tag = document.activeElement?.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select';
}

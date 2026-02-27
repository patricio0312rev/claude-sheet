import { useState, useEffect, useRef, useCallback } from 'react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filterSections = useCallback((searchText: string) => {
    const content = document.getElementById('sheet-content');
    if (!content) return;

    const sections: { heading: Element; elements: Element[] }[] = [];
    let currentSection: { heading: Element; elements: Element[] } | null = null;

    Array.from(content.children).forEach((child) => {
      if (child.tagName === 'H2') {
        if (currentSection) sections.push(currentSection);
        currentSection = { heading: child, elements: [] };
      } else if (currentSection) {
        currentSection.elements.push(child);
      }
    });
    if (currentSection) sections.push(currentSection);

    if (!searchText.trim()) {
      sections.forEach(({ heading, elements }) => {
        (heading as HTMLElement).style.display = '';
        elements.forEach((el) => ((el as HTMLElement).style.display = ''));
      });
      setMatchCount(null);
      return;
    }

    const lowerQuery = searchText.toLowerCase();
    let matches = 0;

    sections.forEach(({ heading, elements }) => {
      const headingText = heading.textContent?.toLowerCase() || '';
      const contentText = elements.map((el) => el.textContent?.toLowerCase() || '').join(' ');
      const isMatch = headingText.includes(lowerQuery) || contentText.includes(lowerQuery);

      (heading as HTMLElement).style.display = isMatch ? '' : 'none';
      elements.forEach((el) => ((el as HTMLElement).style.display = isMatch ? '' : 'none'));

      if (isMatch) matches++;
    });

    setMatchCount(matches);
  }, []);

  useEffect(() => {
    filterSections(query);
  }, [query, filterSections]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !isInputFocused()) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setQuery('');
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative mb-8">
      <div
        className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all duration-200"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
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
          style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search cheat sheet sections"
          placeholder="Search commands, shortcuts..."
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--color-text)' }}
          spellCheck={false}
          autoComplete="off"
        />
        {matchCount !== null ? (
          <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
            {matchCount} match{matchCount !== 1 ? 'es' : ''}
          </span>
        ) : (
          <kbd
            className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[0.625rem] rounded"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
            }}
          >
            /
          </kbd>
        )}
      </div>
    </div>
  );
}

function isInputFocused(): boolean {
  const tag = document.activeElement?.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select';
}

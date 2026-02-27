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
    <div className="relative mt-6 mb-2">
      <div
        className="flex items-center gap-2 rounded border px-3 py-2 text-sm transition-colors focus-within:border-[var(--color-terminal-green)]"
        style={{
          backgroundColor: 'var(--color-terminal-surface)',
          borderColor: 'var(--color-terminal-border)',
        }}
      >
        <span style={{ color: 'var(--color-terminal-text-dim)' }}>$</span>
        <span style={{ color: 'var(--color-terminal-green)' }}>search:</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search cheat sheet sections"
          placeholder="type to filter sections... (press /)"
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--color-terminal-text)' }}
          spellCheck={false}
          autoComplete="off"
        />
        {matchCount !== null && (
          <span className="text-xs" style={{ color: 'var(--color-terminal-text-dim)' }}>
            {matchCount} section{matchCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

function isInputFocused(): boolean {
  const tag = document.activeElement?.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select';
}

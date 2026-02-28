import { useState, useEffect, useRef, useCallback, createElement } from 'react';
import { X, Search } from 'lucide-react';
import { SECTION_ICONS } from '../utils/icons';
import { isInputFocused } from '../utils/dom';

interface Section {
  slug: string;
  title: string;
  text: string;
}

function buildSections(): Section[] {
  const content = document.getElementById('sheet-content');
  if (!content) return [];

  const sections: Section[] = [];
  let current: { slug: string; title: string; elements: Element[] } | null = null;

  Array.from(content.children).forEach((child) => {
    if (child.tagName === 'H2') {
      if (current) {
        sections.push({
          slug: current.slug,
          title: current.title,
          text: current.elements.map((el) => el.textContent || '').join(' '),
        });
      }
      current = {
        slug: child.id,
        title: child.textContent?.replace(/^\s+/, '') || '',
        elements: [],
      };
    } else if (current) {
      current.elements.push(child);
    }
  });
  if (current) {
    sections.push({
      slug: current.slug,
      title: current.title,
      text: current.elements.map((el) => el.textContent || '').join(' '),
    });
  }
  return sections;
}

function getPreview(section: Section, query: string): string {
  if (!query.trim()) return '';
  const lower = query.toLowerCase();
  const idx = section.text.toLowerCase().indexOf(lower);
  if (idx === -1) return section.text.slice(0, 80).trim();
  const start = Math.max(0, idx - 30);
  const end = Math.min(section.text.length, idx + query.length + 50);
  let snippet = section.text.slice(start, end).trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < section.text.length) snippet = snippet + '...';
  return snippet;
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const lower = text.toLowerCase();
  const qLower = query.toLowerCase();
  const idx = lower.indexOf(qLower);
  if (idx === -1) return text;

  return createElement('span', null,
    text.slice(0, idx),
    createElement('span', { style: { color: 'var(--color-accent)', fontWeight: 600 } }, text.slice(idx, idx + query.length)),
    text.slice(idx + query.length),
  );
}

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build section index on mount
  useEffect(() => {
    const timer = setTimeout(() => setSections(buildSections()), 100);
    return () => clearTimeout(timer);
  }, []);

  // Filter results
  const filtered = query.trim()
    ? sections.filter((s) => {
        const q = query.toLowerCase();
        return s.title.toLowerCase().includes(q) || s.text.toLowerCase().includes(q);
      })
    : sections;

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Open modal
  const open = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setActiveIndex(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // Close modal
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  // Navigate to section
  const goTo = useCallback((slug: string) => {
    close();
    const el = document.getElementById(slug);
    if (el) {
      setTimeout(() => {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }, 100);
    }
  }, [close]);

  // Listen for global triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !isInputFocused()) {
        e.preventDefault();
        open();
      }
    };
    const handleOpen = () => open();

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-search', handleOpen);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-search', handleOpen);
    };
  }, [open]);

  // Modal keyboard nav
  const handleModalKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && filtered[activeIndex]) {
      e.preventDefault();
      goTo(filtered[activeIndex].slug);
    }
  }, [close, filtered, activeIndex, goTo]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector('[data-active="true"]');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!isOpen) return null;

  return createElement('div', {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: 'env(safe-area-inset-top, 0px)',
    },
    onClick: (e: React.MouseEvent) => { if (e.target === e.currentTarget) close(); },
    onKeyDown: handleModalKeyDown,
  },
    // Backdrop (desktop only)
    createElement('div', {
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        animation: 'search-backdrop-in 0.2s ease',
      },
      'aria-hidden': 'true',
    }),

    // Modal
    createElement('div', {
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Search cheat sheet',
      style: {
        position: 'relative',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '80vh',
        marginTop: 'max(10vh, 2rem)',
        marginLeft: '1rem',
        marginRight: '1rem',
        background: 'var(--color-bg)',
        border: '2px solid var(--color-border-bright)',
        borderRadius: 0,
        boxShadow: '6px 6px 0 var(--color-border)',
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden',
        animation: 'search-modal-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
      // Search input area
      createElement('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.875rem 1rem',
          borderBottom: '2px solid var(--color-border)',
        },
      },
        createElement(Search, { size: 18, strokeWidth: 2, style: { color: 'var(--color-text-muted)', flexShrink: 0 } }),
        createElement('input', {
          ref: inputRef,
          type: 'text',
          value: query,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
          placeholder: 'Search commands, shortcuts, features...',
          spellCheck: false,
          autoComplete: 'off',
          style: {
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '0.9375rem',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text)',
          },
        }),
        query && createElement('button', {
          onClick: () => { setQuery(''); inputRef.current?.focus(); },
          type: 'button',
          'aria-label': 'Clear search',
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1.5rem',
            height: '1.5rem',
            background: 'var(--color-surface)',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            flexShrink: 0,
          },
        },
          createElement(X, { size: 14, strokeWidth: 2 }),
        ),
        createElement('kbd', {
          style: {
            padding: '0.125rem 0.375rem',
            fontSize: '0.625rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-muted)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            flexShrink: 0,
          },
        }, 'ESC'),
      ),

      // Results
      createElement('div', {
        ref: listRef,
        style: {
          flex: 1,
          overflowY: 'auto' as const,
          padding: '0.5rem',
        },
      },
        filtered.length === 0
          ? createElement('div', {
              style: {
                padding: '2rem 1rem',
                textAlign: 'center' as const,
                color: 'var(--color-text-muted)',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-mono)',
              },
            }, 'No results found')
          : filtered.map((section, i) => {
              const Icon = SECTION_ICONS[section.slug];
              const isActive = i === activeIndex;
              const preview = query.trim() ? getPreview(section, query) : '';

              return createElement('button', {
                key: section.slug,
                type: 'button',
                'data-active': isActive ? 'true' : 'false',
                onClick: () => goTo(section.slug),
                onMouseEnter: () => setActiveIndex(i),
                style: {
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  background: isActive ? 'var(--color-surface)' : 'transparent',
                  border: 'none',
                  borderLeft: isActive ? '3px solid var(--color-accent)' : '3px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left' as const,
                  transition: 'background 0.1s ease',
                },
              },
                Icon && createElement('div', {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '1.5rem',
                    height: '1.5rem',
                    flexShrink: 0,
                    opacity: 0.4,
                    marginTop: '0.125rem',
                  },
                },
                  createElement(Icon, { size: 16, strokeWidth: 2 }),
                ),
                createElement('div', {
                  style: { flex: 1, minWidth: 0 },
                },
                  createElement('div', {
                    style: {
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-heading)',
                      color: 'var(--color-text)',
                      lineHeight: 1.4,
                    },
                  }, highlightMatch(section.title, query)),
                  preview && createElement('div', {
                    style: {
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-muted)',
                      marginTop: '0.125rem',
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    },
                  }, highlightMatch(preview, query)),
                ),
              );
            }),
      ),

      // Footer hint
      createElement('div', {
        style: {
          padding: '0.5rem 1rem',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.625rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
        },
      },
        createElement('span', null, '\u2191\u2193 navigate'),
        createElement('span', null, '\u23CE select'),
        createElement('span', null, 'esc close'),
      ),
    ),
  );
}

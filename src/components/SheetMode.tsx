import { useState, useEffect, useCallback, createElement } from 'react';
import { X } from 'lucide-react';
import { SECTION_ICONS } from '../utils/icons';

interface SheetSection {
  slug: string;
  title: string;
  html: string;
}

function buildSheetSections(): SheetSection[] {
  const content = document.getElementById('sheet-content');
  if (!content) return [];

  const sections: SheetSection[] = [];
  let current: { slug: string; title: string; elements: Element[] } | null = null;

  Array.from(content.children).forEach((child) => {
    if (child.tagName === 'H2') {
      if (current) {
        sections.push({
          slug: current.slug,
          title: current.title,
          html: current.elements.map((el) => el.outerHTML).join(''),
        });
      }
      current = {
        slug: child.id,
        title: child.textContent?.trim() || '',
        elements: [],
      };
    } else if (current && child.tagName !== 'HR') {
      current.elements.push(child);
    }
  });
  if (current) {
    sections.push({
      slug: current.slug,
      title: current.title,
      html: current.elements.map((el) => el.outerHTML).join(''),
    });
  }
  return sections;
}

export default function SheetMode() {
  const [isSheet, setIsSheet] = useState(false);
  const [sections, setSections] = useState<SheetSection[]>([]);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);

  // Initialize state from DOM + build sections on mount
  useEffect(() => {
    setIsSheet(document.documentElement.getAttribute('data-view-mode') === 'sheet');
    const timer = setTimeout(() => setSections(buildSheetSections()), 100);

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setIsSheet(detail === 'sheet');
    };
    const zoomHandler = (e: Event) => {
      const slug = (e as CustomEvent).detail;
      const idx = buildSheetSections().findIndex((s) => s.slug === slug);
      if (idx !== -1) {
        setSections((prev) => prev.length ? prev : buildSheetSections());
        setZoomedIndex(idx);
      }
    };

    window.addEventListener('view-mode-changed', handler);
    window.addEventListener('sheet-zoom-section', zoomHandler);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('view-mode-changed', handler);
      window.removeEventListener('sheet-zoom-section', zoomHandler);
    };
  }, []);

  // Body scroll lock when modal is open
  useEffect(() => {
    if (zoomedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [zoomedIndex]);

  // Escape key to close modal
  useEffect(() => {
    if (zoomedIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomedIndex(null);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [zoomedIndex]);

  const closeModal = useCallback(() => setZoomedIndex(null), []);

  // Always render the grid container; CSS controls visibility via data-view-mode
  const cards = isSheet
    ? sections.map((section, i) => {
        const Icon = SECTION_ICONS[section.slug];
        return createElement(
          'div',
          {
            key: section.slug,
            className: `sheet-card-border-${i % 8}`,
            onClick: () => setZoomedIndex(i),
            style: {
              background: 'var(--color-surface)',
              borderLeftWidth: '4px',
              borderLeftStyle: 'solid' as const,
              padding: '1.25rem',
              cursor: 'pointer',
              boxShadow: 'none',
              transition: 'box-shadow 0.15s ease',
              overflow: 'hidden',
              minWidth: 0,
            },
            onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.boxShadow = '3px 3px 0 var(--color-border)';
            },
            onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.boxShadow = 'none';
            },
          },
          // Header row: icon + title
          createElement(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
              },
            },
            Icon &&
              createElement(
                'div',
                {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    opacity: 0.6,
                  },
                },
                createElement(Icon, { size: 18, strokeWidth: 2 }),
              ),
            createElement(
              'div',
              {
                style: {
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  color: 'var(--color-text)',
                  lineHeight: 1.3,
                },
              },
              section.title,
            ),
          ),
          // Preview
          createElement('div', {
            className: 'sheet-card-preview prose',
            dangerouslySetInnerHTML: { __html: section.html },
          }),
        );
      })
    : null;

  // Zoom modal
  const modal =
    zoomedIndex !== null && sections[zoomedIndex]
      ? createElement(
          'div',
          {
            style: {
              position: 'fixed',
              inset: 0,
              zIndex: 200,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: 'max(8vh, 2rem)',
              paddingBottom: '2rem',
            },
            onClick: (e: React.MouseEvent) => {
              if (e.target === e.currentTarget) closeModal();
            },
          },
          // Backdrop
          createElement('div', {
            style: {
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              animation: 'sheet-backdrop-in 0.2s ease',
            },
            'aria-hidden': 'true',
            onClick: closeModal,
          }),
          // Modal container
          createElement(
            'div',
            {
              role: 'dialog',
              'aria-modal': 'true',
              'aria-label': sections[zoomedIndex].title,
              style: {
                position: 'relative',
                width: '100%',
                maxWidth: '800px',
                maxHeight: '85vh',
                margin: '0 1rem',
                background: 'var(--color-bg)',
                border: '2px solid var(--color-border-bright)',
                boxShadow: '6px 6px 0 var(--color-border)',
                display: 'flex',
                flexDirection: 'column' as const,
                overflow: 'hidden',
                animation: 'sheet-modal-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              },
            },
            // Header
            createElement(
              'div',
              {
                className: `sheet-card-border-${zoomedIndex % 8}`,
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderBottom: '2px solid var(--color-border)',
                  borderLeftWidth: '4px',
                  borderLeftStyle: 'solid' as const,
                },
              },
              createElement(
                'div',
                {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  },
                },
                SECTION_ICONS[sections[zoomedIndex].slug] &&
                  createElement(SECTION_ICONS[sections[zoomedIndex].slug], {
                    size: 20,
                    strokeWidth: 2,
                    style: { opacity: 0.6, flexShrink: 0 },
                  }),
                createElement(
                  'h2',
                  {
                    style: {
                      margin: 0,
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      color: 'var(--color-text)',
                      lineHeight: 1.3,
                    },
                  },
                  sections[zoomedIndex].title,
                ),
              ),
              createElement(
                'button',
                {
                  onClick: closeModal,
                  type: 'button',
                  'aria-label': 'Close modal',
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2rem',
                    height: '2rem',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    flexShrink: 0,
                  },
                },
                createElement(X, { size: 16, strokeWidth: 2 }),
              ),
            ),
            // Content
            createElement('div', {
              className: 'prose',
              style: {
                flex: 1,
                overflowY: 'auto' as const,
                padding: '1.25rem',
              },
              dangerouslySetInnerHTML: { __html: sections[zoomedIndex].html },
            }),
          ),
        )
      : null;

  return createElement(
    'div',
    null,
    createElement(
      'div',
      {
        id: 'sheet-grid',
      },
      cards,
    ),
    modal,
  );
}

import { useEffect } from 'react';

export default function ScrollSpy() {
  useEffect(() => {
    const headings = Array.from(document.querySelectorAll<HTMLElement>('#sheet-content h2'));
    const tocLinks = Array.from(document.querySelectorAll('[data-toc-link]'));

    if (headings.length === 0 || tocLinks.length === 0) return;

    const setActive = (id: string) => {
      tocLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === `#${id}`) {
          link.classList.add('toc-active');
        } else {
          link.classList.remove('toc-active');
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading by comparing boundingClientRect.top
        const visibleEntries = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleEntries.length > 0) {
          setActive(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    );

    headings.forEach((heading) => {
      // Only observe visible headings (not filtered by search)
      if (heading.style.display !== 'none') {
        observer.observe(heading);
      }
    });

    // Re-observe when search filtering changes visibility
    const mutationObserver = new MutationObserver(() => {
      observer.disconnect();
      headings.forEach((heading) => {
        if (heading.style.display !== 'none') {
          observer.observe(heading);
        }
      });
    });

    const content = document.getElementById('sheet-content');
    if (content) {
      mutationObserver.observe(content, {
        attributes: true,
        subtree: true,
        attributeFilter: ['style'],
      });
    }

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}

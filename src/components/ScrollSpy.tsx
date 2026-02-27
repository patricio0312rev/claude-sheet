import { useEffect } from 'react';

export default function ScrollSpy() {
  useEffect(() => {
    const headings = Array.from(document.querySelectorAll('#sheet-content h2'));
    const tocLinks = Array.from(document.querySelectorAll('[data-toc-link]'));

    if (headings.length === 0 || tocLinks.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            tocLinks.forEach((link) => {
              const href = link.getAttribute('href');
              if (href === `#${id}`) {
                link.classList.add('toc-active');
              } else {
                link.classList.remove('toc-active');
              }
            });
          }
        });
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, []);

  return null;
}

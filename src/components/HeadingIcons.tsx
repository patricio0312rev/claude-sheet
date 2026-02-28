import { useEffect, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { SECTION_ICONS as ICON_MAP } from '../utils/icons';

export default function HeadingIcons() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent =
      '.heading-icon svg, .toc-icon svg { stroke-linecap: square !important; stroke-linejoin: miter !important; }';
    document.head.appendChild(style);

    const roots: ReturnType<typeof createRoot>[] = [];
    const containers: HTMLSpanElement[] = [];

    for (const [id, Icon] of Object.entries(ICON_MAP)) {
      const heading = document.getElementById(id);
      if (heading && !heading.querySelector('.heading-icon')) {
        const span = document.createElement('span');
        span.className = 'heading-icon';
        span.style.cssText =
          'display:inline-flex;align-items:center;margin-right:0.5rem;opacity:0.35;vertical-align:middle;position:relative;top:-2px;';
        heading.prepend(span);
        containers.push(span);
        const root = createRoot(span);
        root.render(createElement(Icon, { size: 26, strokeWidth: 2.5 }));
        roots.push(root);
      }

      const tocLink = document.querySelector(
        `a[data-toc-link][href="#${id}"]`,
      );
      if (tocLink && !tocLink.querySelector('.toc-icon')) {
        const span = document.createElement('span');
        span.className = 'toc-icon';
        span.style.cssText =
          'display:inline-flex;align-items:center;margin-right:0.375rem;opacity:0.4;flex-shrink:0;';
        tocLink.prepend(span);
        containers.push(span);
        const root = createRoot(span);
        root.render(createElement(Icon, { size: 14, strokeWidth: 2 }));
        roots.push(root);
      }
    }

    return () => {
      roots.forEach((r) => r.unmount());
      containers.forEach((el) => el.remove());
      style.remove();
    };
  }, []);

  return null;
}

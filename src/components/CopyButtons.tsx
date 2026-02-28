import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import CopyButton from './CopyButton';

export default function CopyButtons() {
  useEffect(() => {
    const preElements = document.querySelectorAll('.prose pre');
    const roots: ReturnType<typeof createRoot>[] = [];

    preElements.forEach((pre) => {
      const code = pre.querySelector('code');
      if (!code) return;

      const text = code.textContent || '';
      const wrapper = document.createElement('div');
      (pre as HTMLElement).style.position = 'relative';
      pre.appendChild(wrapper);

      const root = createRoot(wrapper);
      root.render(<CopyButton text={text} />);
      roots.push(root);
    });

    return () => {
      roots.forEach((root) => root.unmount());
    };
  }, []);

  return null;
}

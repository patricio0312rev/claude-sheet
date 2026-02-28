import { useState, useEffect, useCallback, createElement } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    setMounted(true);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const dark = e.matches;
        document.documentElement.classList.toggle('dark', dark);
        setIsDark(dark);
      }
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    html.classList.add('transitioning');

    const next = !isDark;
    html.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setIsDark(next);

    setTimeout(() => html.classList.remove('transitioning'), 350);
  }, [isDark]);

  if (!mounted) {
    return createElement('div', { className: 'w-8 h-8' });
  }

  return createElement(
    'button',
    {
      onClick: toggleTheme,
      className:
        'w-8 h-8 flex items-center justify-center text-text-muted hover:text-text transition-colors cursor-pointer',
      type: 'button',
      'aria-label': isDark ? 'Switch to light mode' : 'Switch to dark mode',
      title: isDark ? 'Switch to light mode' : 'Switch to dark mode',
    },
    isDark
      ? createElement(Sun, { size: 18, strokeWidth: 2 })
      : createElement(Moon, { size: 18, strokeWidth: 2 }),
  );
}

import { useEffect, useState, useRef } from 'react';

interface ToastMessage {
  id: number;
  text: string;
  leaving: boolean;
}

let toastId = 0;

/** Call from any component/island to trigger a toast */
export function showToast(text: string) {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: text }));
}

export default function Toast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const handler = (e: Event) => {
      const text = (e as CustomEvent).detail as string;
      const id = ++toastId;
      const msg: ToastMessage = { id, text, leaving: false };
      setMessages((prev) => [...prev, msg]);

      const exitTimer = setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, leaving: true } : m)),
        );
        const removeTimer = setTimeout(() => {
          setMessages((prev) => prev.filter((m) => m.id !== id));
          timers.current.delete(id);
        }, 400);
        timers.current.set(id + 100000, removeTimer);
      }, 1400);
      timers.current.set(id, exitTimer);
    };

    window.addEventListener('show-toast', handler);
    return () => {
      window.removeEventListener('show-toast', handler);
      timers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  if (messages.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      alignItems: 'center',
      pointerEvents: 'none',
    }}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            background: 'var(--color-surface-elevated)',
            color: 'var(--color-green)',
            border: '2px solid var(--color-green)',
            borderRadius: '0',
            padding: '0.375rem 0.875rem',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            letterSpacing: '0.02em',
            boxShadow: '3px 3px 0 var(--color-green)',
            opacity: msg.leaving ? 0 : 1,
            transform: msg.leaving ? 'translateY(6px) scale(0.97)' : 'translateY(0) scale(1)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            animation: msg.leaving ? 'none' : 'toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {msg.text}
        </div>
      ))}
    </div>
  );
}

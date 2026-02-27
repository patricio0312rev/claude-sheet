import { useState, useCallback } from 'react';

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-2 py-1 text-xs rounded border transition-all duration-200 cursor-pointer"
      style={{
        color: copied ? 'var(--color-terminal-bg)' : 'var(--color-terminal-text-dim)',
        backgroundColor: copied ? 'var(--color-terminal-green)' : 'transparent',
        borderColor: copied ? 'var(--color-terminal-green)' : 'var(--color-terminal-border)',
      }}
      title="Copy to clipboard"
      type="button"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

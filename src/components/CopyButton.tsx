import { useCallback } from 'react';
import { showToast } from './Toast';

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    showToast('Copied!');
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 flex items-center justify-center gap-1 min-w-[44px] min-h-[44px] px-2 py-1 text-[0.6875rem] transition-all duration-150 cursor-pointer text-border-bright bg-white/[0.08]"
      style={{ borderRadius: 0 }}
      title="Copy to clipboard"
      type="button"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        <rect x="9" y="9" width="13" height="13" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      Copy
    </button>
  );
}

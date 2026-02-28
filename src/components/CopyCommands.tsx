import { useEffect } from 'react';
import { showToast } from './Toast';

/** Sections where clicking the whole row copies the first code element */
const ROW_COPY_SECTIONS = [
  'slash-commands',
  'cli-launch-flags',
  'quick-reference--most-used-combos',
];

/** Sections where individual code elements should be independently copyable */
const CODE_COPY_SECTIONS = [
  'the-big-5--claude-code-extension-system',
  'input-superpowers',
  'configuration-1',
  'file-structure-map',
  'rewind--checkpoints',
  'pro-workflow--how-to-get-the-best-out-of-claude-code',
  'create-custom-commands',
  'remote-control--continue-sessions-from-any-device',
  'hooks--event-automation',
  'permission-modes',
];

function isKeyCombo(text: string): boolean {
  const trimmed = text.trim();
  if (/^(Ctrl|Cmd|Alt|Opt|Shift|Meta|Esc|Enter|Tab|\\)/.test(trimmed)) return true;
  if (/\+[A-Z]$/.test(trimmed)) return true;
  return false;
}

function isCopyableCode(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 2) return false;
  if (isKeyCombo(trimmed)) return false;
  // Skip plain English words that aren't commands/paths
  if (/^(What|Where|Use|How|Like|Your|Just|Separate|Connect|Bundles|Normal|Auto-Accept|Plan Mode)/.test(trimmed)) return false;
  // Skip single generic words
  if (/^[A-Z][a-z]+$/.test(trimmed) && trimmed.length < 10) return false;
  return true;
}

function getSection(el: Element): string | null {
  const allH2s = document.querySelectorAll('#sheet-content h2');
  let closest: string | null = null;
  for (const h2 of allH2s) {
    if (el.compareDocumentPosition(h2) & Node.DOCUMENT_POSITION_PRECEDING) {
      closest = h2.id;
    }
  }
  return closest;
}

function makeCopyable(el: HTMLElement, text: string) {
  el.style.cursor = 'pointer';
  el.title = 'Click to copy';
  const handler = async (e: Event) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied!');
    } catch {
      // Clipboard API not available
    }
  };
  el.addEventListener('click', handler);
  return () => el.removeEventListener('click', handler);
}

export default function CopyCommands() {
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const content = document.getElementById('sheet-content');
    if (!content) return;

    // Add CSS for row hover hint
    const style = document.createElement('style');
    style.textContent = `
      tr.copyable-row { cursor: pointer; }
      tr.copyable-row:hover { background-color: color-mix(in srgb, var(--color-accent) 4%, transparent) !important; }
      code.copyable-code { cursor: pointer; transition: background-color 0.15s ease; }
      code.copyable-code:hover { background-color: color-mix(in srgb, var(--color-accent) 12%, transparent) !important; }
    `;
    document.head.appendChild(style);
    cleanups.push(() => style.remove());

    // 1. Row-level copy for sections with one command per row
    const rows = content.querySelectorAll<HTMLTableRowElement>('tr');
    rows.forEach((row) => {
      const firstTd = row.querySelector('td:first-child');
      if (!firstTd) return;
      const code = firstTd.querySelector('code');
      if (!code) return;
      const text = code.textContent?.trim() || '';
      if (!text || isKeyCombo(text)) return;

      const section = getSection(row);
      if (!section || !ROW_COPY_SECTIONS.includes(section)) return;

      row.classList.add('copyable-row');
      row.title = 'Click to copy';
      cleanups.push(makeCopyable(row, text));
    });

    // 2. Individual code element copy for content-heavy sections
    const codeEls = content.querySelectorAll<HTMLElement>('code');
    codeEls.forEach((code) => {
      // Skip code blocks inside <pre> (handled by CopyButtons)
      if (code.closest('pre')) return;
      // Skip if already handled by row-level copy
      if (code.closest('tr.copyable-row')) return;

      const text = code.textContent?.trim() || '';
      if (!isCopyableCode(text)) return;

      const section = getSection(code);
      if (!section || !CODE_COPY_SECTIONS.includes(section)) return;

      code.classList.add('copyable-code');
      cleanups.push(makeCopyable(code, text));
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}

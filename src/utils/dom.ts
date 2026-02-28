export function isInputFocused(): boolean {
  const tag = document.activeElement?.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select';
}

/** Last word = accent (primary); lead gets normal word space before accent. */
export function splitBrandHeading(text: string): { lead: string; accent: string } {
  const trimmed = text.trim();
  if (!trimmed) return { lead: '', accent: '' };
  const lastSpace = trimmed.lastIndexOf(' ');
  if (lastSpace <= 0) return { lead: '', accent: trimmed };
  return { lead: trimmed.slice(0, lastSpace), accent: trimmed.slice(lastSpace + 1) };
}

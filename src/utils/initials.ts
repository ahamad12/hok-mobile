/** "Jane Doe" → "JD", "jane@x.io" → "J". */
export const getInitials = (name?: string | null): string => {
  const clean = (name ?? '').trim();
  if (!clean) return '?';
  const base = clean.includes('@') ? clean.split('@')[0] : clean;
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const second = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + second).toUpperCase();
};

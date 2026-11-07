// tapt-api stores every amount as an Int of cents (schema.prisma). Convert
// only at the edge: format for display, parse user input back to cents.

const formatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 123456 -> "1,234.56". Negative amounts keep their sign. */
export function formatMoney(cents: number | null | undefined): string {
  if (cents === null || cents === undefined || Number.isNaN(cents)) return '–';
  return formatter.format(cents / 100);
}

/** "+1,234.56" / "-12.00" for signed movements. */
export function formatSignedMoney(cents: number): string {
  const s = formatMoney(Math.abs(cents));
  return cents < 0 ? `-${s}` : `+${s}`;
}

/**
 * "12.5" -> 1250, "1,234.56" -> 123456. Null for anything that is not a
 * non-negative amount with at most two decimals.
 */
export function parseMoneyToCents(input: string): number | null {
  const clean = input.replaceAll(/[,\s]/g, '');
  if (!/^\d+(\.\d{0,2})?$/.test(clean)) return null;
  const [whole, frac = ''] = clean.split('.');
  return Number(whole) * 100 + Number(frac.padEnd(2, '0'));
}

/** Cents -> plain editable text ("12.50"). */
export function centsToInput(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return '';
  return (cents / 100).toFixed(2);
}

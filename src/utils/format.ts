// Money formatting in EUR. Falls back to 0.
export function formatMoney(value: number | undefined | null): string {
  const n = Number(value) || 0;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);
}

// Firestore Timestamp | string | Date -> readable date.
export function formatDate(value: any): string {
  if (!value) return '—';
  let d: Date;
  if (typeof value?.toDate === 'function') d = value.toDate();
  else d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function toMillis(value: any): number {
  if (!value) return 0;
  if (typeof value?.toDate === 'function') return value.toDate().getTime();
  const t = new Date(value).getTime();
  return isNaN(t) ? 0 : t;
}

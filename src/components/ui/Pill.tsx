import { PILL_TONE } from '../../data/constants';

// Status / priority pill — colour (theme-aware) derived from the value.
export default function Pill({ value, noDot }: { value?: string; noDot?: boolean }) {
  if (!value) return null;
  const tone = PILL_TONE[value] || 'neutral';
  return <span className={`pill pill-${tone}${noDot ? ' no-dot' : ''}`}>{value}</span>;
}

import { NEUTRAL_PILL, PILL_COLORS } from '../../data/constants';

// Status / priority pill with colour derived from the value.
export default function Pill({ value }: { value?: string }) {
  if (!value) return null;
  const color = PILL_COLORS[value] || NEUTRAL_PILL;
  return <span className={`pill ${color}`}>{value}</span>;
}

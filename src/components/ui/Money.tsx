import { formatMoney } from '../../utils/format';

// Consistent money display.
export default function Money({
  value,
  className = '',
}: {
  value: number | undefined | null;
  className?: string;
}) {
  return <span className={`tabular-nums ${className}`}>{formatMoney(value)}</span>;
}

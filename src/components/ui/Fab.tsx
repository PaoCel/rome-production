// Round floating "+" action button — the primary add on mobile.
// Hidden on sm+ where pages keep a header button instead (matches the mockups).
export default function Fab({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="fab sm:hidden">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

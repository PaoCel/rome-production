export default function EmptyState({
  title = 'Nothing here yet',
  hint,
}: {
  title?: string;
  hint?: string;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-1 px-6 py-12 text-center">
      <p className="text-sm font-medium text-muted">{title}</p>
      {hint && <p className="text-xs text-faint">{hint}</p>}
    </div>
  );
}

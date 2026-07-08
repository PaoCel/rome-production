import type { ReactNode } from 'react';

export default function PageHeader({
  title,
  count,
  subtitle,
  action,
}: {
  title: string;
  count?: number;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="flex items-center gap-2.5 font-display text-2xl font-semibold text-slate-900">
          {title}
          {typeof count === 'number' && (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-sm font-semibold text-brand-600">
              {count}
            </span>
          )}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

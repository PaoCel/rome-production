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
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-800">
          {title}
          {typeof count === 'number' && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-sm font-medium text-slate-500">
              {count}
            </span>
          )}
        </h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

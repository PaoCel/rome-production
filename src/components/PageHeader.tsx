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
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="flex min-w-0 flex-wrap items-center gap-2.5 font-display text-2xl font-semibold text-slate-900">
          {title}
          {typeof count === 'number' && (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-sm font-semibold text-brand-600">
              {count}
            </span>
          )}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="w-full [&>*]:w-full sm:w-auto sm:shrink-0 sm:[&>*]:w-auto">{action}</div>}
    </div>
  );
}

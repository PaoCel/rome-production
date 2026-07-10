import type { CastingVoteValue } from '../services/castingVotes';

export type CastingVoteCounts = {
  likes: number;
  dislikes: number;
};

export function CastingVoteSummary({ counts }: { counts: CastingVoteCounts }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5" aria-label={`${counts.likes} likes, ${counts.dislikes} dislikes`}>
      <VoteCount value={counts.likes} kind="like" />
      <VoteCount value={counts.dislikes} kind="dislike" />
    </div>
  );
}

function VoteCount({ value, kind }: { value: number; kind: CastingVoteValue }) {
  const positive = kind === 'like';
  return (
    <span
      className={`inline-flex min-w-[3.25rem] items-center justify-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      }`}
    >
      <ThumbIcon kind={kind} className="h-3.5 w-3.5" />
      {value}
    </span>
  );
}

export default function CastingVoteControls({
  counts,
  currentVote,
  disabled,
  onVote,
}: {
  counts: CastingVoteCounts;
  currentVote?: CastingVoteValue;
  disabled?: boolean;
  onVote: (value: CastingVoteValue) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2" aria-label="Vote on this casting profile">
      <VoteButton
        kind="like"
        count={counts.likes}
        active={currentVote === 'like'}
        disabled={disabled}
        onClick={() => onVote('like')}
      />
      <VoteButton
        kind="dislike"
        count={counts.dislikes}
        active={currentVote === 'dislike'}
        disabled={disabled}
        onClick={() => onVote('dislike')}
      />
    </div>
  );
}

function VoteButton({
  kind,
  count,
  active,
  disabled,
  onClick,
}: {
  kind: CastingVoteValue;
  count: number;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const positive = kind === 'like';
  const label = positive ? 'Like' : 'Dislike';
  const activeClass = positive
    ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
    : 'border-rose-500 bg-rose-500 text-white shadow-sm';
  const idleClass = positive
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100'
    : 'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
        active ? activeClass : idleClass
      }`}
    >
      <ThumbIcon kind={kind} className="h-5 w-5" />
      <span>{label}</span>
      <span className={active ? 'text-white/80' : 'opacity-70'}>{count}</span>
    </button>
  );
}

export function ThumbIcon({
  kind,
  className,
}: {
  kind: CastingVoteValue;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {kind === 'like' ? (
        <>
          <path d="M7.5 10.5 11 3.8c.4-.8 1.6-.7 1.9.2.5 1.7.1 3.7-.8 5.2h6.4c1.3 0 2.2 1.2 1.9 2.4l-1.5 6.6c-.2.9-1 1.5-1.9 1.5H7.5" />
          <path d="M3.5 9.5h4v11h-4z" />
        </>
      ) : (
        <>
          <path d="m7.5 13.5 3.5 6.7c.4.8 1.6.7 1.9-.2.5-1.7.1-3.7-.8-5.2h6.4c1.3 0 2.2-1.2 1.9-2.4l-1.5-6.6c-.2-.9-1-1.5-1.9-1.5H7.5" />
          <path d="M3.5 3.5h4v11h-4z" />
        </>
      )}
    </svg>
  );
}

import { useEffect } from 'react';
import type { EntityConfig } from '../data/entities';
import type { CastingVoteValue } from '../services/castingVotes';
import type { EntityDoc } from '../types';
import CastingVoteControls, { type CastingVoteCounts } from './CastingVoteControls';
import Comments from './Comments';
import EntityFields from './EntityFields';
import MediaGallery from './MediaGallery';
import Pill from './ui/Pill';

export default function CastProfileModal({
  option,
  optionConfig,
  roleName,
  counts,
  currentVote,
  voting,
  voteError,
  isSelected,
  committing,
  budgetMsg,
  readOnly,
  onClose,
  onVote,
  onSelect,
  onCommit,
  onEdit,
}: {
  option: EntityDoc;
  optionConfig: EntityConfig;
  roleName?: string;
  counts: CastingVoteCounts;
  currentVote?: CastingVoteValue;
  voting: boolean;
  voteError: string;
  isSelected: boolean;
  committing: boolean;
  budgetMsg: string;
  readOnly: boolean;
  onClose: () => void;
  onVote: (value: CastingVoteValue) => void;
  onSelect: () => void;
  onCommit: () => void;
  onEdit: () => void;
}) {
  const name = option[optionConfig.titleField] || 'Untitled candidate';
  const pills = optionConfig.pillFields.map((field) => option[field]).filter(Boolean) as string[];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-5">
      <button
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close profile"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cast-profile-title"
        className="relative grid h-dvh w-full grid-rows-[minmax(17rem,42dvh)_minmax(0,1fr)] overflow-hidden bg-white shadow-2xl sm:h-[min(92dvh,58rem)] sm:max-w-6xl sm:rounded-3xl md:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.9fr)] md:grid-rows-1"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md backdrop-blur transition hover:bg-white hover:text-slate-900"
          aria-label="Close profile"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
            <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>

        <div className="min-h-0 overflow-y-auto bg-slate-100 px-4 pb-5 pt-14 sm:px-5 md:pt-5">
          {optionConfig.relatedType && (
            <MediaGallery
              relatedType={optionConfig.relatedType}
              relatedId={option.id}
              profileGrid
              readOnly={readOnly}
            />
          )}
        </div>

        <div className="min-h-0 overflow-y-auto border-t border-slate-200 bg-slate-50 md:border-l md:border-t-0">
          <header className="border-b border-slate-200 bg-white px-4 py-4 pr-14 sm:px-5 sm:py-5 sm:pr-14">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="section-label">Casting profile</p>
                <h2 id="cast-profile-title" className="mt-1 break-words font-display text-2xl font-semibold text-slate-900">
                  {name}
                </h2>
                {roleName && <p className="mt-0.5 text-sm text-slate-500">{roleName}</p>}
              </div>
              {!readOnly && (
                <button type="button" className="btn-secondary hidden sm:inline-flex" onClick={onEdit}>
                  Edit
                </button>
              )}
            </div>

            {(isSelected || pills.length > 0) && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {isSelected && (
                  <span className="pill bg-brand-50 text-brand-700 ring-brand-200">Selected</span>
                )}
                {pills.map((pill, index) => <Pill key={`${pill}-${index}`} value={pill} />)}
              </div>
            )}
          </header>

          <div className="space-y-5 p-4 sm:p-5">
            <section className="card p-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-slate-800">Your vote</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Your vote applies to the complete profile. Choosing one removes the other.
                </p>
              </div>
              <CastingVoteControls
                counts={counts}
                currentVote={currentVote}
                disabled={voting}
                onVote={onVote}
              />
              {voteError && <p className="mt-2 text-xs font-medium text-rose-600">{voteError}</p>}
              {currentVote && !voteError && (
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  Tap your active vote again to remove it.
                </p>
              )}
            </section>

            {!readOnly && (
              <section className="card border-brand-100 bg-brand-50/60 p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-slate-800">Production selection</h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Voting is independent from the official casting selection.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    className={isSelected ? 'btn-secondary flex-1' : 'btn-primary flex-1'}
                    onClick={onSelect}
                  >
                    {isSelected ? 'Deselect' : 'Select candidate'}
                  </button>
                  {optionConfig.budgetSource && (
                    <button
                      type="button"
                      className="btn-secondary flex-1"
                      onClick={onCommit}
                      disabled={!isSelected || committing}
                    >
                      {committing ? 'Committing…' : 'Commit to budget'}
                    </button>
                  )}
                </div>
                {budgetMsg && <p className="mt-2 text-xs font-medium text-emerald-600">{budgetMsg}</p>}
              </section>
            )}

            {!readOnly && (
              <button type="button" className="btn-secondary w-full sm:hidden" onClick={onEdit}>
                Edit profile
              </button>
            )}

            <EntityFields config={optionConfig} item={option} />

            {optionConfig.relatedType && (
              <Comments
                relatedType={optionConfig.relatedType}
                relatedId={option.id}
                readOnly={readOnly}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

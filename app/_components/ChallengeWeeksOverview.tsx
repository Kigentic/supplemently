'use client';

// 8-Wochen Challenge Übersicht — wiederverwendbare Komponente.
// Wochenfarben sind bewusst hartkodierte Hex-Werte (kein Dark-Mode-Invert).
import { useState } from 'react';
import Link from 'next/link';
import { ICON_MAP, carryForwardText, type ChallengeWeek } from '@/lib/challengeWeeks';
import AnleitungLink from '@/app/_components/AnleitungModal';

function ChevronIcon({ open, color }: { open: boolean; color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke={color} strokeWidth="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WeekTile({
  week,
  isCurrent,
  locked,
  open,
  onToggle,
}: {
  week: ChallengeWeek;
  isCurrent: boolean;
  locked: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const Icon = ICON_MAP[week.icon_name];
  const carry = carryForwardText(week.num);

  return (
    <div
      className={`flex h-[390px] flex-col overflow-hidden rounded-xl border-[0.5px] border-outline bg-bg ${
        isCurrent ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg' : ''
      } ${locked ? 'opacity-60' : ''}`}
    >
      {/* Farbige Leiste — klickbar, klappt die Karte auf/zu (gesperrt für künftige Wochen) */}
      <button
        type="button"
        onClick={onToggle}
        disabled={locked}
        aria-expanded={open}
        aria-disabled={locked}
        className={`flex w-full shrink-0 items-center gap-2 px-3 py-2.5 text-left ${locked ? 'cursor-not-allowed' : ''}`}
        style={{ backgroundColor: week.color }}
      >
        <Icon size={16} stroke={1.75} color={week.textColor} aria-hidden="true" />
        <span className="text-[13px] font-bold leading-none" style={{ color: week.textColor }}>
          {week.num}
        </span>
        <span className="min-w-0 flex-1 truncate text-[12px] font-medium" style={{ color: week.textColor }}>
          {week.theme}
        </span>
        {locked ? <LockIcon color={week.textColor} /> : <ChevronIcon open={open} color={week.textColor} />}
      </button>

      {/* Inhalt bleibt immer im Layout reserviert — nur bei geöffneter, freigeschalteter Karte sichtbar. */}
      {locked ? (
        <div className="flex flex-1 items-center justify-center px-3.5 py-3 text-center text-[12px] text-text-muted">
          Wird ab Woche {week.num} freigeschaltet.
        </div>
      ) : (
      <div
        aria-hidden={!open}
        className={`flex-1 overflow-y-auto px-3.5 py-3 ${open ? '' : 'invisible'}`}
      >
        <p className="text-[12px] italic text-text-muted">{week.motto}</p>

        <ul className="mt-2.5 space-y-1.5">
          {week.habits.map((habit) => (
            <li key={habit.text} className="flex items-start gap-2 text-[13px] leading-snug text-text-muted">
              <span
                className="mt-1.5 h-[5px] w-[5px] flex-shrink-0 rounded-full"
                style={{ backgroundColor: week.color }}
                aria-hidden="true"
              />
              <span>
                {habit.text}
                {habit.anleitungVarianten && (
                  <>
                    {' '}
                    <AnleitungLink varianten={habit.anleitungVarianten} contextWeek={week.num} />
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {week.pillars.map((pillar) => (
            <span
              key={pillar}
              className="rounded-md border-[0.5px] border-outline bg-outline/10 px-2 py-0.5 text-[11px] text-text-muted"
            >
              {pillar}
            </span>
          ))}
        </div>

        {carry && (
          <p className="mt-3 border-t-[0.5px] border-outline pt-2.5 text-[11px] text-text-muted">
            {carry}
          </p>
        )}

        <Link
          href={`/challenge/woche/${week.num}`}
          className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
        >
          Warum diese Aufgaben? →
        </Link>
      </div>
      )}
    </div>
  );
}

export default function ChallengeWeeksOverview({
  weeks,
  currentWeek,
  unlockAll = false,
}: {
  weeks: ChallengeWeek[];
  currentWeek?: number;
  /** Masteradmin/Studio-Admin darf zu Test-/Vorschauzwecken alle Wochen sehen. */
  unlockAll?: boolean;
}) {
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(() => new Set(currentWeek ? [currentWeek] : []));

  function toggle(num: number) {
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  }

  return (
    <section aria-label="8-Wochen Challenge Übersicht">
      <h2 className="mb-4 text-lg font-semibold text-text">Dein Challenge Plan</h2>

      <div className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {weeks.map((week) => (
          <WeekTile
            key={week.num}
            week={week}
            isCurrent={week.num === currentWeek}
            locked={!unlockAll && currentWeek != null && week.num > currentWeek}
            open={openWeeks.has(week.num)}
            onToggle={() => toggle(week.num)}
          />
        ))}
      </div>
    </section>
  );
}

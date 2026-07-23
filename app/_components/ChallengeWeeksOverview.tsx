'use client';

// 8-Wochen Challenge Übersicht — wiederverwendbare Komponente.
// Wochenfarben sind bewusst hartkodierte Hex-Werte (kein Dark-Mode-Invert).
import { useState } from 'react';
import Link from 'next/link';
import { CHALLENGE_WEEKS, carryForwardText, type ChallengeWeek } from '@/lib/challengeWeeks';

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

function WeekTile({
  week,
  isCurrent,
  open,
  onToggle,
}: {
  week: ChallengeWeek;
  isCurrent: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const Icon = week.icon;
  const carry = carryForwardText(week.num);

  return (
    <div
      className={`flex h-[390px] flex-col overflow-hidden rounded-xl border-[0.5px] border-outline bg-bg ${
        isCurrent ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg' : ''
      }`}
    >
      {/* Farbige Leiste — klickbar, klappt die Karte auf/zu */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full shrink-0 items-center gap-2 px-3 py-2.5 text-left"
        style={{ backgroundColor: week.color }}
      >
        <Icon size={16} stroke={1.75} color={week.textColor} aria-hidden="true" />
        <span className="text-[13px] font-bold leading-none" style={{ color: week.textColor }}>
          {week.num}
        </span>
        <span className="min-w-0 flex-1 truncate text-[12px] font-medium" style={{ color: week.textColor }}>
          {week.theme}
        </span>
        <ChevronIcon open={open} color={week.textColor} />
      </button>

      {/* Inhalt bleibt immer im Layout reserviert — nur bei geöffneter Karte sichtbar. */}
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
              {habit.text}
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
    </div>
  );
}

export default function ChallengeWeeksOverview({ currentWeek }: { currentWeek?: number }) {
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

      <div className="grid grid-cols-2 items-start gap-3">
        {CHALLENGE_WEEKS.map((week) => (
          <WeekTile
            key={week.num}
            week={week}
            isCurrent={week.num === currentWeek}
            open={openWeeks.has(week.num)}
            onToggle={() => toggle(week.num)}
          />
        ))}
      </div>
    </section>
  );
}

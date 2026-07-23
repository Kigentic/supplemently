'use client';

// 8-Wochen Challenge Übersicht — wiederverwendbare Komponente.
// Wochenfarben sind bewusst hartkodierte Hex-Werte (kein Dark-Mode-Invert).
import { useState } from 'react';
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
      className={`overflow-hidden rounded-xl border-[0.5px] border-outline bg-surface ${
        isCurrent ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg' : ''
      }`}
    >
      {/* Farbige Leiste — klickbar, klappt die Karte auf/zu */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
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

      {open && (
        <div className="px-3.5 py-3">
          <p className="text-[12px] italic text-text-muted">{week.motto}</p>

          <ul className="mt-2.5 space-y-1.5">
            {week.habits.map((habit) => (
              <li key={habit} className="flex items-start gap-2 text-[13px] leading-snug text-text-muted">
                <span
                  className="mt-1.5 h-[5px] w-[5px] flex-shrink-0 rounded-full"
                  style={{ backgroundColor: week.color }}
                  aria-hidden="true"
                />
                {habit}
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
        </div>
      )}
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
      {/* Header */}
      <p className="mb-2 text-[11px] text-text-muted">Lifestyle Challenge · Gesundheit &amp; Longevity</p>
      <div className="mb-6 flex flex-wrap gap-2">
        <span className="rounded-md border-[0.5px] border-accent/30 bg-accent/10 px-2.5 py-[3px] text-[11px] text-accent">
          §20 Ernährungs-App
        </span>
        <span className="rounded-md border-[0.5px] border-accent/30 bg-accent/10 px-2.5 py-[3px] text-[11px] text-accent">
          KI-Supplementratgeber
        </span>
      </div>

      {/* Wochen-Strip */}
      <div className="mb-6 flex items-center">
        <div className="flex gap-1" aria-hidden="true">
          {CHALLENGE_WEEKS.map((w) => (
            <div
              key={w.num}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-md text-[13px] font-medium"
              style={{ backgroundColor: w.color, color: w.textColor }}
            >
              {w.num}
            </div>
          ))}
        </div>
        <div className="ml-1.5 h-px flex-1 border-t-[0.5px] border-accent/40" />
        <span className="ml-2 whitespace-nowrap text-[11px] text-text-muted">progressiv aufbauend</span>
      </div>

      {/* Wochen-Kacheln: 2x4-Grid, Farbleiste klappt einzeln auf */}
      <div className="grid grid-cols-2 items-start gap-2.5 sm:grid-cols-4">
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

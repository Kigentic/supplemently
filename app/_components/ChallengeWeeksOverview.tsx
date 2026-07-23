// 8-Wochen Challenge Übersicht — wiederverwendbare Komponente.
// Wochenfarben sind bewusst hartkodierte Hex-Werte (kein Dark-Mode-Invert).
import { CHALLENGE_WEEKS, carryForwardText, type ChallengeWeek } from '@/lib/challengeWeeks';

function WeekCard({ week, isCurrent }: { week: ChallengeWeek; isCurrent: boolean }) {
  const Icon = week.icon;
  const carry = carryForwardText(week.num);

  return (
    <div
      className={`flex overflow-hidden rounded-xl border-[0.5px] border-outline bg-surface ${
        isCurrent ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg' : ''
      }`}
    >
      <div
        className="flex min-w-[52px] w-[52px] flex-shrink-0 flex-col items-center justify-center gap-1"
        style={{ backgroundColor: week.color }}
      >
        <Icon size={18} stroke={1.75} color={week.textColor} aria-hidden="true" />
        <span className="text-[22px] font-medium leading-none" style={{ color: week.textColor }}>
          {week.num}
        </span>
      </div>

      <div className="min-w-0 flex-1 px-4 py-3.5">
        <p className="text-[15px] font-medium text-text">{week.theme}</p>
        <p className="mt-0.5 text-[12px] italic text-text-muted">{week.motto}</p>

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
    </div>
  );
}

export default function ChallengeWeeksOverview({ currentWeek }: { currentWeek?: number }) {
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

      {/* Wochen-Cards */}
      <div className="flex flex-col gap-2">
        {CHALLENGE_WEEKS.map((week) => (
          <WeekCard key={week.num} week={week} isCurrent={week.num === currentWeek} />
        ))}
      </div>
    </section>
  );
}

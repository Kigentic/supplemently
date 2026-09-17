'use client';

// Geteilte Bausteine für Fragebogen-Wizards — genutzt vom eingeloggten
// /fragebogen (app/fragebogen/page.tsx) UND vom Gast-Pre-Onboarding auf der
// Longevity-Landingpage (app/longevity-challenge/plan/page.tsx). Rein
// präsentational, keine eigene State-Logik.
import type { ReactNode } from 'react';

export const inputBase =
  'rounded-lg border border-outline bg-bg px-4 py-3 text-text placeholder:text-text-muted ' +
  'outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30';

export function OptionPill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={
        'rounded-full border px-4 py-2.5 text-sm font-medium transition ' +
        (selected
          ? 'border-accent bg-accent text-on-accent'
          : 'border-outline bg-bg text-text hover:border-text')
      }
    >
      {label}
    </button>
  );
}

// ── Body-Type-Icons ──────────────────────────────────────────────────────────

function BodyMaleSchlank() {
  return (
    <svg viewBox="0 0 40 80" fill="currentColor" className="h-14 w-auto">
      <circle cx="20" cy="9" r="7" />
      <path d="M14,17 Q20,15 26,17 L25,50 Q20,53 15,50 Z" />
      <rect x="13" y="49" width="6" height="24" rx="3" />
      <rect x="21" y="49" width="6" height="24" rx="3" />
    </svg>
  );
}
function BodyMaleNormal() {
  return (
    <svg viewBox="0 0 40 80" fill="currentColor" className="h-14 w-auto">
      <circle cx="20" cy="9" r="7" />
      <path d="M10,17 Q20,14 30,17 L28,50 Q20,54 12,50 Z" />
      <rect x="11" y="49" width="7" height="24" rx="3" />
      <rect x="22" y="49" width="7" height="24" rx="3" />
    </svg>
  );
}
function BodyMaleUntersetzt() {
  return (
    <svg viewBox="0 0 40 80" fill="currentColor" className="h-14 w-auto">
      <circle cx="20" cy="9" r="7" />
      <path d="M5,17 Q20,13 35,17 L33,48 Q20,53 7,48 Z" />
      <rect x="7" y="47" width="9" height="24" rx="4" />
      <rect x="24" y="47" width="9" height="24" rx="4" />
    </svg>
  );
}
function BodyMaleFett() {
  return (
    <svg viewBox="0 0 40 80" fill="currentColor" className="h-14 w-auto">
      <circle cx="20" cy="9" r="7" />
      <path d="M11,17 Q20,14 29,17 L33,36 Q34,52 20,55 Q6,52 7,36 Z" />
      <rect x="9" y="51" width="8" height="22" rx="3" />
      <rect x="23" y="51" width="8" height="22" rx="3" />
    </svg>
  );
}

function BodyFemaleSchlank() {
  return (
    <svg viewBox="0 0 40 80" fill="currentColor" className="h-14 w-auto">
      <circle cx="20" cy="9" r="7" />
      <path d="M15,17 Q20,15 25,17 L24,31 Q20,34 20,34 Q20,34 16,31 Z" />
      <path d="M15,34 Q20,31 25,34 L26,50 Q20,55 14,50 Z" />
      <rect x="13" y="49" width="6" height="24" rx="3" />
      <rect x="21" y="49" width="6" height="24" rx="3" />
    </svg>
  );
}
function BodyFemaleNormal() {
  return (
    <svg viewBox="0 0 40 80" fill="currentColor" className="h-14 w-auto">
      <circle cx="20" cy="9" r="7" />
      <path d="M12,17 Q20,14 28,17 L26,31 Q20,35 20,35 Q20,35 14,31 Z" />
      <path d="M13,35 Q20,32 27,35 L29,50 Q20,56 11,50 Z" />
      <rect x="11" y="49" width="7" height="24" rx="3" />
      <rect x="22" y="49" width="7" height="24" rx="3" />
    </svg>
  );
}
function BodyFemaleUntersetzt() {
  return (
    <svg viewBox="0 0 40 80" fill="currentColor" className="h-14 w-auto">
      <circle cx="20" cy="9" r="7" />
      <path d="M13,17 Q20,14 27,17 L25,31 Q20,34 20,34 Q20,34 15,31 Z" />
      <path d="M9,34 Q20,30 31,34 L33,50 Q20,57 7,50 Z" />
      <rect x="9" y="49" width="8" height="24" rx="4" />
      <rect x="23" y="49" width="8" height="24" rx="4" />
    </svg>
  );
}
function BodyFemaleFett() {
  return (
    <svg viewBox="0 0 40 80" fill="currentColor" className="h-14 w-auto">
      <circle cx="20" cy="9" r="7" />
      <ellipse cx="20" cy="39" rx="16" ry="19" />
      <rect x="10" y="54" width="7" height="20" rx="3" />
      <rect x="23" y="54" width="7" height="20" rx="3" />
    </svg>
  );
}

const BODY_TYPES = [
  { value: 'schlank', label: 'Schlank' },
  { value: 'normal', label: 'Normal' },
  { value: 'untersetzt', label: 'Untersetzt' },
  { value: 'fett', label: 'Mollig' },
] as const;

const BODY_ICONS: Record<string, Record<string, ReactNode>> = {
  männlich: {
    schlank: <BodyMaleSchlank />,
    normal: <BodyMaleNormal />,
    untersetzt: <BodyMaleUntersetzt />,
    fett: <BodyMaleFett />,
  },
  weiblich: {
    schlank: <BodyFemaleSchlank />,
    normal: <BodyFemaleNormal />,
    untersetzt: <BodyFemaleUntersetzt />,
    fett: <BodyFemaleFett />,
  },
};

export function BodyTypeSelector({
  selected,
  geschlecht,
  onChange,
}: {
  selected: string;
  geschlecht: string;
  onChange: (v: string) => void;
}) {
  const icons = BODY_ICONS[geschlecht] ?? BODY_ICONS['männlich'];
  return (
    <div className="flex gap-3">
      {BODY_TYPES.map(({ value, label }) => {
        const active = selected === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(selected === value ? '' : value)}
            aria-pressed={active}
            className={
              'flex flex-1 flex-col items-center gap-2 rounded-xl border px-2 py-3 transition ' +
              (active
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-outline bg-bg text-text-muted hover:border-text hover:text-text')
            }
          >
            {icons[value]}
            <span className="text-xs font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function QuestionBlock({
  nr,
  frage,
  optional,
  children,
}: {
  nr: number;
  frage: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-outline/50 py-6 first:pt-0 last:border-b-0 last:pb-0">
      <p className="mb-3 text-sm font-semibold text-text">
        <span className="mr-2 text-accent">{String(nr).padStart(2, '0')}</span>
        {frage}
        {optional && <span className="ml-2 text-xs font-normal text-text-muted">(optional)</span>}
      </p>
      {children}
    </div>
  );
}

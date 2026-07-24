// Gemeinsame Formular-Bausteine für Wochen-Check-ins.
// Genutzt vom echten Check-in (/challenge/checkin) und der
// Admin-Testseite (/challenge/admin/checkin-test).
'use client';

export type Ampel = 'gruen' | 'gelb' | 'rot';

const AMPEL_OPTIONS: { value: Ampel; label: string; dot: string; active: string }[] = [
  { value: 'gruen', label: 'Komplett', dot: 'bg-emerald-500', active: 'border-emerald-500 bg-emerald-500/10 text-emerald-700' },
  { value: 'gelb', label: 'Teilweise', dot: 'bg-amber-400', active: 'border-amber-400 bg-amber-400/10 text-amber-700' },
  { value: 'rot', label: 'Gar nicht', dot: 'bg-red-400', active: 'border-red-400 bg-red-400/10 text-red-700' },
];

export function TrafficLight({ value, onChange }: { value: Ampel | null; onChange: (v: Ampel) => void }) {
  return (
    <div className="flex gap-2">
      {AMPEL_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            value === opt.value ? opt.active : 'border-outline text-text-muted hover:border-text'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${opt.dot}`} />
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function ScalePicker({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium transition ${
            value === n
              ? 'border-accent bg-accent text-on-accent'
              : 'border-outline text-text-muted hover:border-text'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

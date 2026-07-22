// Eigene SVG-Illustrationen für die Challenge-Landingpage.
// Kein Stock-Bildmaterial: geometrische, markenfarbige Grafiken.

// ── Orbit-Grafik (Hero) — 5 Lifestyle-Bereiche kreisen um "Dich" ────────────

const ORBIT_ITEMS = [
  { icon: '💊', label: 'Supplements', x: 160, y: 8 },
  { icon: '🏋️', label: 'Training', x: 303, y: 114 },
  { icon: '🥗', label: 'Ernährung', x: 248, y: 282 },
  { icon: '😴', label: 'Schlaf', x: 72, y: 282 },
  { icon: '🧠', label: 'Mental', x: 17, y: 114 },
];

export function OrbitGraphic() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[320px]">
      {/* Rotierender gestrichelter Ring */}
      <svg
        viewBox="0 0 320 320"
        className="absolute inset-0 h-full w-full animate-[spin_50s_linear_infinite]"
        style={{ animationDirection: 'reverse' }}
      >
        <circle cx="160" cy="160" r="150" fill="none" stroke="var(--color-outline)" strokeWidth="1.5" strokeDasharray="2 8" opacity="0.6" />
      </svg>
      <svg viewBox="0 0 320 320" className="absolute inset-0 h-full w-full animate-[spin_70s_linear_infinite]">
        <circle cx="160" cy="160" r="118" fill="none" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="1 6" opacity="0.35" />
      </svg>

      {/* Zentrum: "Du" */}
      <div
        className="absolute flex h-28 w-28 flex-col items-center justify-center rounded-full text-center shadow-lg"
        style={{
          left: 160 - 56,
          top: 160 - 56,
          background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)',
        }}
      >
        <span className="text-2xl">✨</span>
        <span className="mt-1 text-xs font-semibold text-on-accent">Dein Ich</span>
        <span className="text-[10px] font-medium text-on-accent/80">in 8 Wochen</span>
      </div>

      {/* Orbit-Chips */}
      {ORBIT_ITEMS.map((item) => (
        <div
          key={item.label}
          className="absolute flex w-[92px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-2xl border border-outline/60 bg-bg px-2 py-2.5 shadow-sm"
          style={{ left: item.x, top: item.y }}
        >
          <span className="text-lg">{item.icon}</span>
          <span className="text-center text-[10px] font-medium leading-tight text-text">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Stat-Bar für Vorher/Nachher-Vergleich ────────────────────────────────────

export function StatBar({ label, from, to, unit = '/10' }: { label: string; from: number; to: number; unit?: string }) {
  const max = 10;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-text-muted">
        <span>{label}</span>
        <span className="text-text">
          {from}{unit} <span className="text-accent">→ {to}{unit}</span>
        </span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-outline/30">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-outline/70"
          style={{ width: `${(from / max) * 100}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${(to / max) * 100}%`,
            background: 'linear-gradient(90deg, var(--color-accent-dark), var(--color-accent))',
          }}
        />
      </div>
    </div>
  );
}

// ── Progress-Ring für Wissenschafts-Stats ────────────────────────────────────

export function ProgressRing({ pct, size = 84 }: { pct: number; size?: number }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-outline)" strokeWidth="7" opacity="0.35" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

// ── 3-Säulen-Hub-Diagramm ─────────────────────────────────────────────────────

export function PillarHub() {
  const pillars = [
    { icon: '🏋️', label: 'Training', desc: 'Auf dein Level abgestimmt' },
    { icon: '🥗', label: 'Ernährung', desc: 'Passend zu deinem Stil' },
    { icon: '💊', label: 'Supplements', desc: 'Nur was du brauchst' },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {pillars.map((p, i) => (
        <div key={p.label} className="relative">
          <div className="flex h-full flex-col items-center rounded-2xl border border-outline/50 bg-bg p-6 text-center">
            <div
              className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(79,144,193,0.15), rgba(79,144,193,0.05))' }}
            >
              {p.icon}
            </div>
            <p className="font-semibold text-text">{p.label}</p>
            <p className="mt-1 text-sm text-text-muted">{p.desc}</p>
          </div>
          {i < 2 && (
            <div className="absolute top-1/2 -right-4 hidden -translate-y-1/2 text-outline sm:block">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 4l8 8-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Wochen-Timeline (kompakt, horizontal) ────────────────────────────────────

const WEEKS = [
  { w: 1, label: 'Fundament' },
  { w: 2, label: 'Bewegung' },
  { w: 3, label: 'Ernährung' },
  { w: 4, label: 'Mental' },
  { w: 5, label: 'Intensität' },
  { w: 6, label: 'Schlaf' },
  { w: 7, label: 'Feintuning' },
  { w: 8, label: 'Auswertung' },
];

export function WeekTimeline() {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="relative flex min-w-[640px] items-start justify-between px-2 sm:min-w-0">
        <div className="absolute left-0 right-0 top-5 h-px bg-outline/50" />
        <div
          className="absolute left-0 top-5 h-px"
          style={{ width: '100%', background: 'linear-gradient(90deg, var(--color-accent), transparent)' }}
        />
        {WEEKS.map((w) => (
          <div key={w.w} className="relative z-10 flex flex-col items-center gap-2" style={{ width: `${100 / 8}%` }}>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold"
              style={{
                borderColor: 'var(--color-accent)',
                background: w.w === 1 ? 'var(--color-accent)' : 'var(--color-bg)',
                color: w.w === 1 ? 'var(--color-on-accent)' : 'var(--color-accent)',
              }}
            >
              {w.w}
            </div>
            <span className="text-center text-[11px] font-medium leading-tight text-text-muted">{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Krankenkassen-Icon ────────────────────────────────────────────────────────

export function ShieldHeartIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z"
        stroke="var(--color-accent)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.5s-3.2-1.9-3.2-4.2c0-1.15.95-2.05 2.05-2.05.65 0 1.15.3 1.15.3s.5-.3 1.15-.3c1.1 0 2.05.9 2.05 2.05 0 2.3-3.2 4.2-3.2 4.2Z"
        fill="var(--color-accent)"
      />
    </svg>
  );
}

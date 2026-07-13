'use client';

import { useEffect, useState } from 'react';

type Tier = 'basis' | 'advanced' | 'addon';

interface Supp {
  id: string;
  name: string;
  kategorie: string;
  tier: Tier;
}

const TIER_LABELS: Record<Tier, string> = {
  basis: 'Basis',
  advanced: 'Advanced',
  addon: 'Add-on',
};

const TIER_COLORS: Record<Tier, string> = {
  basis: 'text-emerald-600',
  advanced: 'text-violet-600',
  addon: 'text-sky-600',
};

export default function TierPage() {
  const [supps, setSupps] = useState<Supp[]>([]);
  const [tiers, setTiers] = useState<Record<string, Tier>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/tiers')
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setError('Tier-Spalte fehlt noch. Bitte zuerst die Migration im Supabase SQL-Editor ausführen.');
          return;
        }
        setSupps(data as Supp[]);
        const initial: Record<string, Tier> = {};
        (data as Supp[]).forEach((s) => { initial[s.id] = s.tier ?? 'addon'; });
        setTiers(initial);
      })
      .catch(() => setError('Supplements konnten nicht geladen werden.'))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    const payload = Object.entries(tiers).map(([id, tier]) => ({ id, tier }));
    const res = await fetch('/api/admin/tiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
    else setError('Fehler beim Speichern.');
  }

  // Group by kategorie
  const grouped: Record<string, Supp[]> = {};
  supps.forEach((s) => {
    if (!grouped[s.kategorie]) grouped[s.kategorie] = [];
    grouped[s.kategorie].push(s);
  });

  const counts: Record<Tier, number> = { basis: 0, advanced: 0, addon: 0 };
  Object.values(tiers).forEach((t) => counts[t]++);

  if (loading) return <div className="p-10 text-center text-gray-500">Lade Supplements…</div>;
  if (error) return (
    <div className="p-10 text-center">
      <p className="mb-4 text-red-600 font-medium">{error}</p>
      <pre className="mx-auto max-w-xl rounded bg-gray-100 p-4 text-left text-xs text-gray-700">
{`ALTER TABLE public.supplements
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'addon'
  CHECK (tier IN ('basis', 'advanced', 'addon'));`}
      </pre>
      <p className="mt-4 text-sm text-gray-500">Supabase Dashboard → SQL Editor → ausführen → Seite neu laden</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Supplement Tier-Klassifizierung</h1>
            <div className="mt-1 flex gap-4 text-sm">
              <span className="font-medium text-emerald-600">Basis: {counts.basis}</span>
              <span className="font-medium text-violet-600">Advanced: {counts.advanced}</span>
              <span className="font-medium text-sky-600">Add-on: {counts.addon}</span>
              <span className="text-gray-400">Gesamt: {supps.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-sm font-medium text-emerald-600">✓ Gespeichert</span>}
            {error && <span className="text-sm text-red-500">{error}</span>}
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
            >
              {saving ? 'Speichern…' : 'Alle speichern'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mx-auto max-w-4xl px-6 pt-6">
        {/* Column headers */}
        <div className="mb-2 grid grid-cols-[1fr_90px_90px_90px] gap-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          <span>Supplement</span>
          <span className="text-center text-emerald-600">Basis</span>
          <span className="text-center text-violet-600">Advanced</span>
          <span className="text-center text-sky-600">Add-on</span>
        </div>

        {Object.entries(grouped).map(([kat, items]) => (
          <div key={kat} className="mb-4">
            <div className="mb-1 px-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              {kat}
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              {items.map((s, i) => {
                const current = tiers[s.id] ?? 'addon';
                return (
                  <div
                    key={s.id}
                    className={
                      'grid grid-cols-[1fr_90px_90px_90px] items-center gap-2 px-4 py-3 ' +
                      (i < items.length - 1 ? 'border-b border-gray-100' : '')
                    }
                  >
                    <span className={`text-sm font-medium ${TIER_COLORS[current]}`}>
                      {s.name}
                    </span>
                    {(['basis', 'advanced', 'addon'] as Tier[]).map((t) => (
                      <label key={t} className="flex cursor-pointer justify-center">
                        <input
                          type="radio"
                          name={s.id}
                          value={t}
                          checked={current === t}
                          onChange={() => {
                            setTiers((prev) => ({ ...prev, [s.id]: t }));
                            setSaved(false);
                          }}
                          className="h-4 w-4 cursor-pointer accent-gray-800"
                        />
                      </label>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

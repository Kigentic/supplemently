'use client';

// Dummy-Seite zum Testen der Check-in-Fragen für jede Woche einzeln —
// nur für Masteradmins. Umgeht das Datums-Gate über die Admin-Rechte
// der API-Route und schreibt einen echten Check-in für den eigenen
// Account in der gewählten Woche (überschreibt vorhandene Daten dafür).
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';
import { CHALLENGE_WEEKS, habitsUpTo } from '@/lib/challengeWeeks';
import { TrafficLight, ScalePicker, type Ampel } from '@/app/_components/CheckinControls';

type Status = 'idle' | 'submitting' | 'success';

export default function CheckinTestPage() {
  const router = useRouter();
  const [checkedAdmin, setCheckedAdmin] = useState(false);

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [habitStatus, setHabitStatus] = useState<Record<string, Ampel>>({});
  const [wohlbefinden, setWohlbefinden] = useState<number | null>(null);
  const [schwierigkeit, setSchwierigkeit] = useState<number | null>(null);
  const [erfolg, setErfolg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [scoreResult, setScoreResult] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = getBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push('/challenge/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('ist_admin')
        .eq('id', userData.user.id)
        .maybeSingle();
      if (cancelled) return;
      if (!(profile as { ist_admin: boolean } | null)?.ist_admin) {
        router.push('/challenge/dashboard');
        return;
      }
      setCheckedAdmin(true);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  function selectWeek(num: number) {
    setSelectedWeek(num);
    setHabitStatus({});
    setWohlbefinden(null);
    setSchwierigkeit(null);
    setErfolg('');
    setError(null);
    setStatus('idle');
    setScoreResult(null);
  }

  const weekGroups = selectedWeek ? habitsUpTo(selectedWeek) : [];
  const allHabitKeys = weekGroups.flatMap((g) => g.items.map((i) => i.key));
  const allAnswered = allHabitKeys.length > 0 && allHabitKeys.every((k) => habitStatus[k]);

  async function onSubmit() {
    if (!selectedWeek) return;
    setError(null);
    if (!allAnswered) {
      setError('Bitte für jede Gewohnheit eine Ampel auswählen.');
      return;
    }
    if (wohlbefinden === null || schwierigkeit === null) {
      setError('Bitte beide Skalen ausfüllen.');
      return;
    }

    setStatus('submitting');
    const supabase = getBrowserClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      setError('Session abgelaufen. Bitte neu einloggen.');
      setStatus('idle');
      return;
    }

    try {
      const res = await fetch('/api/challenge/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          woche: selectedWeek,
          habit_status: habitStatus,
          wohlbefinden,
          schwierigkeit,
          erfolg_freitext: erfolg,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || 'Check-in konnte nicht gespeichert werden.');
        setStatus('idle');
        return;
      }
      setScoreResult(json.score_woche ?? null);
      setStatus('success');
    } catch {
      setError('Server nicht erreichbar.');
      setStatus('idle');
    }
  }

  if (!checkedAdmin) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader loggedIn />
        <main className="mx-auto max-w-2xl px-5 py-24 text-center">
          <p className="text-text-muted">Wird geladen …</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader loggedIn />

      <main className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Masteradmin · Testmodus</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Check-in-Fragen testen
          </h1>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            Wähle eine Woche und fülle den Check-in aus, unabhängig vom Datums-Gate. Speichert einen
            echten Check-in für deinen Account in der gewählten Woche — überschreibt vorhandene Daten
            für diese Woche.
          </p>
        </div>

        {/* Wochen-Buttons */}
        <div className="mb-10 grid grid-cols-4 gap-2">
          {CHALLENGE_WEEKS.map((week) => (
            <button
              key={week.num}
              type="button"
              onClick={() => selectWeek(week.num)}
              className={`flex flex-col items-center gap-1 rounded-xl border-[0.5px] px-2 py-3 transition ${
                selectedWeek === week.num ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg' : 'border-outline'
              }`}
              style={{ backgroundColor: week.color }}
            >
              <span className="text-lg font-bold leading-none" style={{ color: week.textColor }}>
                {week.num}
              </span>
              <span className="text-center text-[10px] font-medium leading-tight" style={{ color: week.textColor }}>
                {week.theme}
              </span>
            </button>
          ))}
        </div>

        {selectedWeek && status === 'success' && (
          <div className="rounded-2xl bg-accent/10 p-6 text-center">
            <p className="text-lg font-semibold text-text">Check-in für Woche {selectedWeek} gespeichert ✓</p>
            <p className="mt-1 text-sm text-text-muted">
              {scoreResult !== null ? `Score: ${scoreResult} Punkte.` : ''} Wähle oben eine andere Woche zum Weitertesten.
            </p>
          </div>
        )}

        {selectedWeek && status !== 'success' && (
          <div className="space-y-8">
            {weekGroups.map(({ week, items }) => (
              <section key={week.num}>
                <div className="mb-3 flex items-center gap-2.5">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                    style={{ backgroundColor: week.color, color: week.textColor }}
                  >
                    {week.num}
                  </span>
                  <span className="text-sm font-semibold text-text">{week.theme}</span>
                </div>
                <div className="space-y-3 rounded-2xl bg-surface p-5">
                  {items.map((item) => (
                    <div
                      key={item.key}
                      className="flex flex-col gap-2 border-b border-outline/40 pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <p className="text-sm text-text">{item.text}</p>
                      <TrafficLight
                        value={habitStatus[item.key] ?? null}
                        onChange={(v) => setHabitStatus((s) => ({ ...s, [item.key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <section>
              <p className="mb-1 text-sm font-semibold text-text">Wie gut fühlst du dich diese Woche?</p>
              <p className="mb-3 text-xs text-text-muted">1 = richtig schlecht · 10 = topfit</p>
              <ScalePicker value={wohlbefinden} onChange={setWohlbefinden} />
            </section>

            <section>
              <p className="mb-1 text-sm font-semibold text-text">Wie schwer waren die Aufgaben diese Woche?</p>
              <p className="mb-3 text-xs text-text-muted">1 = kinderleicht · 10 = richtig hart</p>
              <ScalePicker value={schwierigkeit} onChange={setSchwierigkeit} />
            </section>

            <section>
              <label htmlFor="erfolg" className="mb-1.5 block text-sm font-semibold text-text">
                Größter Erfolg diese Woche <span className="font-normal text-text-muted">(optional)</span>
              </label>
              <textarea
                id="erfolg"
                rows={3}
                value={erfolg}
                onChange={(e) => setErfolg(e.target.value)}
                className="w-full rounded-lg border border-outline bg-bg px-4 py-3 text-text placeholder:text-text-muted outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
                placeholder="Was lief richtig gut?"
              />
            </section>

            {error && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={onSubmit}
              disabled={status === 'submitting'}
              className="w-full rounded-full bg-accent px-7 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'submitting' ? 'Wird gespeichert …' : `Test-Check-in Woche ${selectedWeek} abschicken`}
            </button>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

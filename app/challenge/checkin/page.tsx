'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';
import { habitsUpTo } from '@/lib/challengeWeeks';
import { getChallengeSchedule, formatUnlockDate } from '@/lib/challengeSchedule';

type Ampel = 'gruen' | 'gelb' | 'rot';

const AMPEL_OPTIONS: { value: Ampel; label: string; dot: string; active: string }[] = [
  { value: 'gruen', label: 'Komplett', dot: 'bg-emerald-500', active: 'border-emerald-500 bg-emerald-500/10 text-emerald-700' },
  { value: 'gelb', label: 'Teilweise', dot: 'bg-amber-400', active: 'border-amber-400 bg-amber-400/10 text-amber-700' },
  { value: 'rot', label: 'Gar nicht', dot: 'bg-red-400', active: 'border-red-400 bg-red-400/10 text-red-700' },
];

function TrafficLight({ value, onChange }: { value: Ampel | null; onChange: (v: Ampel) => void }) {
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

function ScalePicker({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
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

interface CheckinData {
  teilnahmeId: string;
  currentWeek: number;
  alreadySubmitted: boolean;
  unlocked: boolean;
  unlockDate: Date;
}

export default function CheckinPage() {
  const router = useRouter();
  const [data, setData] = useState<CheckinData | null>(null);
  const [loading, setLoading] = useState(true);

  const [habitStatus, setHabitStatus] = useState<Record<string, Ampel>>({});
  const [wohlbefinden, setWohlbefinden] = useState<number | null>(null);
  const [schwierigkeit, setSchwierigkeit] = useState<number | null>(null);
  const [erfolg, setErfolg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [scoreResult, setScoreResult] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = getBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        router.push('/challenge/login');
        return;
      }

      const [{ data: teilnahme }, { data: profile }] = await Promise.all([
        supabase
          .from('challenge_teilnahmen')
          .select('id, status, challenges ( start_datum, wochen_anzahl )')
          .eq('user_id', user.id)
          .order('joined_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from('profiles').select('ist_admin').eq('id', user.id).maybeSingle(),
      ]) as [{ data: any }, { data: { ist_admin: boolean } | null }];

      if (cancelled) return;

      if (!teilnahme) {
        router.push('/fragebogen');
        return;
      }
      if (teilnahme.status === 'pre_registered') {
        router.push('/fragebogen');
        return;
      }

      const isAdmin = !!profile?.ist_admin;
      const challenge = Array.isArray(teilnahme.challenges) ? teilnahme.challenges[0] : teilnahme.challenges;
      const wochenAnzahl = challenge?.wochen_anzahl ?? 8;
      const schedule = challenge?.start_datum
        ? getChallengeSchedule(challenge.start_datum, wochenAnzahl)
        : { currentWeek: 1, checkinUnlocked: false, checkinUnlockDate: new Date() };
      const currentWeek = schedule.currentWeek;

      const { data: existingCheckin } = await supabase
        .from('wochencheckins')
        .select('id')
        .eq('teilnahme_id', teilnahme.id)
        .eq('woche', currentWeek)
        .maybeSingle();

      if (cancelled) return;

      setData({
        teilnahmeId: teilnahme.id,
        currentWeek,
        alreadySubmitted: !!existingCheckin,
        unlocked: isAdmin || schedule.checkinUnlocked,
        unlockDate: schedule.checkinUnlockDate,
      });
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const weekGroups = data ? habitsUpTo(data.currentWeek) : [];
  const allHabitKeys = weekGroups.flatMap((g) => g.items.map((i) => i.key));
  const allAnswered = allHabitKeys.length > 0 && allHabitKeys.every((k) => habitStatus[k]);

  async function onSubmit() {
    setError(null);
    if (!allAnswered) {
      setError('Bitte für jede Gewohnheit eine Ampel auswählen.');
      return;
    }
    if (wohlbefinden === null) {
      setError('Bitte angeben, wie gut du dich diese Woche gefühlt hast.');
      return;
    }
    if (schwierigkeit === null) {
      setError('Bitte angeben, wie schwer die Aufgaben waren.');
      return;
    }

    setStatus('submitting');
    const supabase = getBrowserClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken || !data) {
      setError('Session abgelaufen. Bitte neu einloggen.');
      setStatus('idle');
      return;
    }

    try {
      const res = await fetch('/api/challenge/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          woche: data.currentWeek,
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
      setError('Server nicht erreichbar. Bitte erneut versuchen.');
      setStatus('idle');
    }
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader loggedIn />
        <main className="mx-auto max-w-2xl px-5 py-24 text-center">
          <p className="text-text-muted">Check-in wird geladen …</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!data.unlocked) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader loggedIn />
        <main className="mx-auto max-w-xl px-5 py-20 text-center sm:py-28">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-outline/20 text-3xl">
            🔒
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Check-in noch nicht offen.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            Der Check-in für Woche {data.currentWeek} ist ab {formatUnlockDate(data.unlockDate)} verfügbar.
            Bis dahin: fleißig die Gewohnheiten dieser Woche umsetzen.
          </p>
          <Link
            href="/challenge/dashboard"
            className="mt-8 inline-block rounded-full bg-accent px-8 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover"
          >
            Zurück zum Dashboard
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (data.alreadySubmitted || status === 'success') {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader loggedIn />
        <main className="mx-auto max-w-xl px-5 py-20 text-center sm:py-28">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-3xl">
            ✓
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Check-in für Woche {data.currentWeek} ist drin.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            {scoreResult !== null
              ? `Du hast ${scoreResult} Punkte für diese Woche gesammelt.`
              : 'Dein Check-in für diese Woche ist bereits gespeichert.'}
          </p>
          <Link
            href="/challenge/dashboard"
            className="mt-8 inline-block rounded-full bg-accent px-8 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover"
          >
            Zurück zum Dashboard
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader loggedIn />

      <main className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Wochen-Check-in
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Wie lief Woche {data.currentWeek}?
          </h1>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            Für jede Gewohnheit: komplett umgesetzt, teilweise, oder gar nicht. Ehrlich sein bringt mehr als schön färben.
          </p>
        </div>

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
                  <div key={item.key} className="flex flex-col gap-2 border-b border-outline/40 pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
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
              Größter Erfolg diese Woche <span className="text-text-muted font-normal">(optional)</span>
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
            {status === 'submitting' ? 'Wird gespeichert …' : 'Check-in abschicken'}
          </button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

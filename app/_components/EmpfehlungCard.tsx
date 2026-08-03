'use client';

// Empfehlungslink-Karte: Teilnehmer kann seinen persönlichen Anmeldelink
// kopieren und sieht, wie viele Personen sich darüber schon registriert
// haben. Kein Bonus-System, nur Link + Zähler (siehe /api/challenge/empfehlungslink).
import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabaseBrowser';

export default function EmpfehlungCard() {
  const [link, setLink] = useState<string | null>(null);
  const [anzahl, setAnzahl] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = getBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const res = await fetch('/api/challenge/empfehlungslink', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok || cancelled) return;
      const json = await res.json();
      setLink(json.link);
      setAnzahl(json.anzahl ?? 0);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!link) return null;

  function copyLink() {
    navigator.clipboard.writeText(link!);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-8 rounded-2xl border border-outline/60 bg-surface p-5">
      <p className="font-semibold text-text">Lade Freunde ein</p>
      <p className="mt-1 text-sm text-text-muted">
        Mach die Challenge mit einer Freundin, einem Nachbarn oder Arbeitskollegen zusammen —
        gemeinsam motiviert's doppelt so gut.
      </p>
      <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={copyLink}
          className="w-full rounded-full border border-outline px-5 py-2.5 text-sm font-medium text-text transition hover:border-text sm:w-auto"
        >
          {copied ? 'Link kopiert ✓' : 'Meinen Empfehlungslink kopieren'}
        </button>
        <p className="text-sm text-text-muted">
          {anzahl === 0 ? 'Noch niemand eingeladen.' : `${anzahl} ${anzahl === 1 ? 'Person' : 'Personen'} bereits eingeladen.`}
        </p>
      </div>
    </div>
  );
}

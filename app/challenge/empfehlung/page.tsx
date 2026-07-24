'use client';

// Touchpoint 1 (GAMEPLAN Kap. 12.1) — direkt nach dem Onboarding-Fragebogen.
// Zeigt die beim Onboarding geloggten Affiliate-Empfehlungen, bevor es zur
// Ernährungs-App weitergeht.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';
import AffiliateProductCard, { type AffiliateProduct } from '@/app/_components/AffiliateProductCard';

export default function EmpfehlungPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [empfehlungen, setEmpfehlungen] = useState<AffiliateProduct[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = getBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push('/challenge/login');
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        router.push('/challenge/login');
        return;
      }

      const res = await fetch('/api/challenge/empfehlung', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (cancelled) return;

      if (res.ok) {
        const json = await res.json();
        setEmpfehlungen(json.empfehlungen ?? []);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader loggedIn />

      <main className="mx-auto max-w-xl px-5 py-16 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Für dich ausgesucht</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
          Das könnte gut zu dir passen
        </h1>
        <p className="mt-3 text-base leading-relaxed text-text-muted">
          Basierend auf deinen Antworten im Fragebogen — passend zu deinem Start in die Challenge.
        </p>

        {loading && <p className="mt-10 text-text-muted">Wird geladen …</p>}

        {!loading && empfehlungen.length === 0 && (
          <p className="mt-10 text-text-muted">Gerade keine passende Empfehlung — schau später wieder vorbei.</p>
        )}

        {!loading && empfehlungen.length > 0 && (
          <div className="mt-8 space-y-4">
            {empfehlungen.map((p) => (
              <AffiliateProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push('/challenge/ernaehrungsapp')}
          className="mt-10 w-full rounded-full bg-accent px-7 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover"
        >
          Weiter zur Ernährungs-App
        </button>
      </main>

      <SiteFooter />
    </div>
  );
}

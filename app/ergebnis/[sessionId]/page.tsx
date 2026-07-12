// Supplemently — Ergebnisseite (Stage 3, nur Funktion, kein Styling).
// Lädt sessions.ergebnis anhand der sessionId aus Supabase (serverseitig).

import Link from 'next/link';
import { getServiceClient } from '@/lib/supabaseServer';
import type { MatchResult, Empfehlung } from '@/lib/matching';

export const dynamic = 'force-dynamic';

function EmpfehlungItem({ e }: { e: Empfehlung }) {
  return (
    <li style={{ marginBottom: '0.75rem' }}>
      <strong>{e.name}</strong>
      <div>Begründung: {e.begruendung}</div>
      <div>Dosierung: {e.dosierung ?? '—'}</div>
    </li>
  );
}

export default async function ErgebnisPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  // UUID-Basischeck, um sinnlose DB-Queries zu vermeiden.
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);

  let ergebnis: MatchResult | null = null;
  let notFound = false;

  if (isUuid) {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('sessions')
      .select('ergebnis')
      .eq('id', sessionId)
      .maybeSingle();

    if (error || !data) notFound = true;
    else ergebnis = data.ergebnis as MatchResult;
  } else {
    notFound = true;
  }

  if (notFound || !ergebnis) {
    return (
      <main>
        <h1>Ergebnis nicht gefunden</h1>
        <p>Zu dieser Session gibt es kein Ergebnis.</p>
        <p>
          <Link href="/fragebogen">Zum Fragebogen</Link>
        </p>
      </main>
    );
  }

  const essenziell = ergebnis.essenziell ?? [];
  const optional = ergebnis.optional ?? [];

  return (
    <main>
      <h1>Deine Empfehlungen</h1>

      <section>
        <h2>Essenziell</h2>
        {essenziell.length ? (
          <ul>
            {essenziell.map((e) => (
              <EmpfehlungItem key={e.id} e={e} />
            ))}
          </ul>
        ) : (
          <p>Keine essenziellen Empfehlungen für dein Profil.</p>
        )}
      </section>

      <section>
        <h2>Optional</h2>
        {optional.length ? (
          <ul>
            {optional.map((e) => (
              <EmpfehlungItem key={e.id} e={e} />
            ))}
          </ul>
        ) : (
          <p>Keine optionalen Empfehlungen.</p>
        )}
      </section>

      <hr />
      <p>
        <small>{ergebnis.disclaimer}</small>
      </p>

      <p>
        <Link href="/fragebogen">Neuen Fragebogen ausfüllen</Link>
      </p>
    </main>
  );
}

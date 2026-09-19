// Cron (siehe vercel.json): hält Charles' Trainingsplan-Wissen automatisch
// synchron mit der DB, egal wann/wie ein Trainingsplan zuletzt geändert
// wurde (Migration, künftig auch eine Admin-UI). Vorher musste nach jeder
// Trainingsplan-Änderung manuell `npm run ingest:kb` laufen — das wurde
// zuverlässig vergessen (siehe Chat-Verlauf: Charles hatte nach mehreren
// Migrationen veraltete Plan-Inhalte). Re-Ingestion ist günstig genug
// (~35-40 kurze Dokumente, ein Embedding-Call pro Dokument), um bei jedem
// Tick einfach komplett neu zu laufen statt Änderungen zu tracken.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { ingestTrainingsplaeneAusDb } from '@/lib/kbTrainingsplaene';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('CRON_SECRET fehlt in der Umgebung.');
    return NextResponse.json({ error: 'Server nicht konfiguriert.' }, { status: 500 });
  }
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });
  }

  const supabase = getServiceClient();
  try {
    const anzahl = await ingestTrainingsplaeneAusDb(supabase);
    return NextResponse.json({ ok: true, plaene: anzahl }, { status: 200 });
  } catch (err) {
    console.error('Trainingsplan-Reingestion error:', err);
    return NextResponse.json({ error: 'Reingestion fehlgeschlagen.' }, { status: 500 });
  }
}

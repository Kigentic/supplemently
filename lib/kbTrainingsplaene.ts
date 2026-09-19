// Baut die Charles-Wissens-Dokumente für Trainingspläne direkt aus den
// DB-Tabellen (trainingsplaene/trainingsplan_uebungen) — einzige Quelle der
// Wahrheit, kein Auseinanderdriften wie vorher mit separat gepflegten
// kb/*.md-Dateien. Wird sowohl vom manuellen Skript (scripts/ingest-kb.ts)
// als auch vom Cron-Job (app/api/cron/reingest-trainingsplaene) genutzt, der
// das nach jeder Migration automatisch nachzieht — siehe GAMEPLAN/Chat-Verlauf.
import type { SupabaseClient } from '@supabase/supabase-js';
import { chunkText, embedTexts } from '@/lib/kb';

const EMBED_BATCH_SIZE = 100;

export async function replaceDocumentWithChunks(
  supabase: SupabaseClient,
  title: string,
  sourceType: string,
  challengeTypId: string | null,
  chunks: string[]
) {
  // Vorherige Version löschen (cascade räumt kb_chunks mit auf) — Aufruf ist
  // damit gefahrlos wiederholbar.
  await supabase.from('kb_documents').delete().eq('title', title);

  const { data: doc, error: docError } = await supabase
    .from('kb_documents')
    .insert({ title, source_type: sourceType, challenge_typ_id: challengeTypId })
    .select('id')
    .single();
  if (docError || !doc) {
    throw new Error(`Konnte Dokument "${title}" nicht anlegen: ${docError?.message}`);
  }

  for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
    const embeddings = await embedTexts(batch);
    const rows = batch.map((content, j) => ({
      document_id: doc.id,
      challenge_typ_id: challengeTypId,
      chunk_index: i + j,
      content,
      embedding: embeddings[j],
    }));
    const { error: insertError } = await supabase.from('kb_chunks').insert(rows);
    if (insertError) throw new Error(`Chunk-Insert fehlgeschlagen: ${insertError.message}`);
  }
}

async function replaceDocument(
  supabase: SupabaseClient,
  title: string,
  sourceType: string,
  challengeTypId: string | null,
  text: string
) {
  await replaceDocumentWithChunks(supabase, title, sourceType, challengeTypId, chunkText(text));
}

export async function ingestTrainingsplaeneAusDb(supabase: SupabaseClient): Promise<number> {
  const { data: plaene, error } = await supabase
    .from('trainingsplaene')
    .select(
      'id, plan_key, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, voraussetzung, phasen, trainer_hinweise'
    );
  if (error) throw new Error(`Konnte trainingsplaene nicht laden: ${error.message}`);
  if (!plaene || plaene.length === 0) return 0;

  for (const plan of plaene as any[]) {
    const { data: uebungen } = await supabase
      .from('trainingsplan_uebungen')
      .select('name, saetze, wiederholungen, pause_sekunden')
      .eq('trainingsplan_id', plan.id)
      .order('sort_order', { ascending: true });

    const parts: string[] = [
      `Trainingsplan ${plan.plan_key} — ${plan.name}`,
      `Zielgruppe: ${plan.zielgruppe}`,
      `Fokus: ${plan.fokus_text}`,
      `Frequenz: ${plan.frequenz} · ca. ${plan.netto_minuten} Min. netto · Pause ${plan.pause_hinweis}`,
    ];
    if (plan.voraussetzung) parts.push(`Wichtiger Hinweis: ${plan.voraussetzung}`);
    if (Array.isArray(plan.phasen) && plan.phasen.length > 0) {
      parts.push(
        'Phasen:\n' +
          plan.phasen
            .map((p: any) => `Phase ${p.nummer} (Woche ${p.wochen_von}-${p.wochen_bis}): ${p.ziel}`)
            .join('\n')
      );
    }
    parts.push(
      'Übungen:\n' +
        (uebungen ?? [])
          .map((u: any) =>
            `- ${u.name}${u.saetze ? ` — ${u.saetze} Sätze` : ''}${u.wiederholungen ? ` × ${u.wiederholungen}` : ''}${u.pause_sekunden ? `, ${u.pause_sekunden}s Pause` : ''}`
          )
          .join('\n')
    );
    if (Array.isArray(plan.trainer_hinweise) && plan.trainer_hinweise.length > 0) {
      parts.push('Trainer-Hinweise:\n' + plan.trainer_hinweise.map((h: string) => `- ${h}`).join('\n'));
    }

    await replaceDocument(supabase, `🏋️ Trainingsplan ${plan.plan_key} – ${plan.name}`, 'trainingsplan', null, parts.join('\n\n'));
  }

  return plaene.length;
}

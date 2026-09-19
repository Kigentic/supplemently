// Einmal- bzw. Re-Ingestion-Skript für die KI-Coach-Wissensdatenbank.
// Läuft die Wissens-PDFs (global) und die Challenge-Inhalte pro
// Challenge-Typ (Habits/Anleitungen/Übungen) durch, chunked, embedded
// (OpenAI text-embedding-3-small) und schreibt in kb_documents/kb_chunks.
// Aufruf: npm run ingest:kb
import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import { getServiceClient } from '../lib/supabaseServer';
import { chunkText, embedTexts } from '../lib/kb';
import { getOpenAIClient, CHAT_MODEL, withRateLimitRetry } from '../lib/openai';

// Jede globale Wissens-PDF unter kb/. `ocr: true` nur für PDFs mit
// Kopierschutz (Fließtext als Bild eingebettet, z.B. "The Supplement
// Bible") — alle anderen haben normalen, direkt extrahierbaren Text.
const PDFS: { file: string; title: string; ocr?: boolean }[] = [
  { file: 'The Supplement Bible.pdf', title: 'The Supplement Bible', ocr: true },
  { file: 'HPN_Smart-Eating_A4.pdf', title: 'Smart Eating — Ernährung ohne Geheimwissen' },
  { file: 'HPN_How-to-be-healthy_A4.pdf', title: 'How to be healthy — Die paar Dinge, die wirklich etwas ändern' },
];
const EMBED_BATCH_SIZE = 100;
const OCR_CONCURRENCY = 1;

const OCR_PROMPT =
  'Das ist eine Seite aus einem Supplement-Guide, deren Fließtext als Bild eingebettet ist ' +
  '(Kopierschutz). Transkribiere den GESAMTEN lesbaren Inhalt der Seite vollständig und ' +
  'akkurat als Klartext (inkl. Tabellen als einfache Liste). Gib NUR den transkribierten ' +
  'Inhalt zurück, keine Kommentare, keine Wiederholung des Wasserzeichens ("Generated for ...").';

async function ocrPageOnce(dataUrl: string): Promise<string> {
  const openai = getOpenAIClient();
  const res = await withRateLimitRetry(() =>
    openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: OCR_PROMPT },
            { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
          ],
        },
      ],
    })
  );
  return res.choices[0]?.message?.content?.trim() ?? '';
}

// Seiten ohne Inhalt (Kapiteltrenner, leer) liefern nur ein paar Wörter —
// alles darunter ist verdächtig kurz für eine volle Buchseite, einmal retryen
// statt stillschweigend Inhalt zu verlieren (Modell war beim ersten Versuch
// nachweislich manchmal falsch-negativ).
const SUSPICIOUSLY_SHORT = 40;

async function ocrPage(dataUrl: string): Promise<string> {
  const first = await ocrPageOnce(dataUrl);
  if (first.length >= SUSPICIOUSLY_SHORT) return first;
  const second = await ocrPageOnce(dataUrl);
  return second.length > first.length ? second : first;
}

async function runWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function replaceDocumentWithChunks(
  supabase: ReturnType<typeof getServiceClient>,
  title: string,
  sourceType: string,
  challengeTypId: string | null,
  chunks: string[]
) {
  // Vorherige Version löschen (cascade räumt kb_chunks mit auf) — Skript ist
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

  console.log(`  "${title}": ${chunks.length} Chunks`);

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
    console.log(`    ... ${Math.min(i + EMBED_BATCH_SIZE, chunks.length)}/${chunks.length}`);
  }
}

async function replaceDocument(
  supabase: ReturnType<typeof getServiceClient>,
  title: string,
  sourceType: string,
  challengeTypId: string | null,
  text: string
) {
  await replaceDocumentWithChunks(supabase, title, sourceType, challengeTypId, chunkText(text));
}

async function ingestPdfsOcr(
  supabase: ReturnType<typeof getServiceClient>,
  pdfPath: string,
  title: string
) {
  console.log('  Vision-OCR (Text ist als Bild eingebettet) …');
  const buffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: buffer });
  const info = await parser.getInfo();
  const totalPages = info.total;
  console.log(`  ${totalPages} Seiten — rendere & transkribiere (Concurrency ${OCR_CONCURRENCY}) …`);

  let done = 0;
  const pageTexts = await runWithConcurrency(
    Array.from({ length: totalPages }, (_, i) => i + 1),
    OCR_CONCURRENCY,
    async (pageNum) => {
      const shot = await parser.getScreenshot({ partial: [pageNum], imageDataUrl: true, desiredWidth: 1000 });
      const dataUrl = shot.pages[0]?.dataUrl;
      const text = dataUrl ? await ocrPage(dataUrl) : '';
      done += 1;
      if (done % 10 === 0 || done === totalPages) console.log(`    ... ${done}/${totalPages}`);
      return text;
    }
  );
  await parser.destroy();

  const fullText = pageTexts.filter(Boolean).join('\n\n');
  await replaceDocument(supabase, title, 'pdf', null, fullText);
}

async function ingestPdfText(
  supabase: ReturnType<typeof getServiceClient>,
  pdfPath: string,
  title: string
) {
  console.log('  Extrahiere Text direkt (kein Kopierschutz) …');
  const buffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  await replaceDocument(supabase, title, 'pdf', null, result.text);
}

async function ingestPdfs(supabase: ReturnType<typeof getServiceClient>) {
  for (const pdf of PDFS) {
    const pdfPath = path.join(process.cwd(), 'kb', pdf.file);
    if (!fs.existsSync(pdfPath)) {
      console.log(`Keine PDF unter ${pdfPath} gefunden — überspringe "${pdf.title}".`);
      continue;
    }
    console.log(`Lese "${pdf.title}" …`);
    if (pdf.ocr) {
      await ingestPdfsOcr(supabase, pdfPath, pdf.title);
    } else {
      await ingestPdfText(supabase, pdfPath, pdf.title);
    }
  }
}

async function ingestChallengeContent(supabase: ReturnType<typeof getServiceClient>) {
  const { data: typen, error } = await supabase.from('challenge_typen').select('id, name');
  if (error) throw new Error(`Konnte challenge_typen nicht laden: ${error.message}`);

  for (const typ of typen ?? []) {
    const { data: wochen } = await supabase
      .from('challenge_typ_wochen')
      .select(
        'woche_nummer, theme, motto, challenge_typ_habits ( text, why, challenge_typ_habit_anleitungen ( titel, challenge_typ_habit_uebungen ( name, dauer, hinweis ) ) )'
      )
      .eq('challenge_typ_id', typ.id)
      .order('woche_nummer', { ascending: true });

    if (!wochen || wochen.length === 0) continue;

    const parts: string[] = [];
    for (const w of wochen as any[]) {
      parts.push(`Woche ${w.woche_nummer}: ${w.theme}${w.motto ? ` — ${w.motto}` : ''}`);
      for (const habit of w.challenge_typ_habits ?? []) {
        parts.push(`Gewohnheit: ${habit.text}\nWarum: ${habit.why}`);
        for (const anleitung of habit.challenge_typ_habit_anleitungen ?? []) {
          parts.push(`Anleitung "${anleitung.titel}":`);
          for (const uebung of anleitung.challenge_typ_habit_uebungen ?? []) {
            parts.push(`- ${uebung.name} (${uebung.dauer})${uebung.hinweis ? `: ${uebung.hinweis}` : ''}`);
          }
        }
      }
    }

    await replaceDocument(supabase, `${typ.name} — Aufgaben & Anleitungen`, 'challenge_content', typ.id, parts.join('\n\n'));
  }
}

async function ingestUebungsbibliothek(supabase: ReturnType<typeof getServiceClient>) {
  const { data: uebungen, error } = await supabase
    .from('uebungsbibliothek')
    .select('muskelgruppe, name, varianten')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(`Konnte Übungsbibliothek nicht laden: ${error.message}`);
  if (!uebungen || uebungen.length === 0) {
    console.log('Übungsbibliothek ist leer — überspringe.');
    return;
  }

  // Ein Chunk pro Übung (statt Freitext-Splitting) für präzises Retrieval,
  // z.B. bei Fragen wie "Wie kann ich Kniebeugen sonst noch ausführen?".
  const chunks = uebungen.map(
    (u) => `Muskelgruppe: ${u.muskelgruppe}\nÜbung: ${u.name}\nAusführungsvarianten: ${u.varianten}`
  );

  await replaceDocumentWithChunks(supabase, 'Übungsbibliothek', 'exercise_library', null, chunks);
}

// Quelle der Wahrheit sind die DB-Tabellen (trainingsplaene/
// trainingsplan_uebungen), NICHT mehr die statischen kb/*.md-Dateien — die
// waren nur der ursprüngliche Seed-Inhalt und driften seitdem auseinander,
// sobald ein Plan direkt per Migration geändert wird (siehe Chat-Verlauf:
// M4/F5-F8/M6/M7 überarbeitet, ohne dass Charles davon wusste). Diese
// Funktion baut die Wissens-Dokumente live aus der DB, damit Charles nie
// wieder veraltete Trainingsplan-Inhalte hat.
async function ingestTrainingsplaeneAusDb(supabase: ReturnType<typeof getServiceClient>) {
  const { data: plaene, error } = await supabase
    .from('trainingsplaene')
    .select(
      'id, plan_key, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, voraussetzung, phasen, trainer_hinweise'
    );
  if (error) throw new Error(`Konnte trainingsplaene nicht laden: ${error.message}`);
  if (!plaene || plaene.length === 0) {
    console.log('Keine Trainingspläne in der DB gefunden — überspringe.');
    return;
  }

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
}

async function main() {
  const supabase = getServiceClient();
  const only = process.argv[2]?.replace(/^--only=/, '');

  if (!only || only === 'challenge') {
    console.log('Ingestiere Challenge-Inhalte …');
    await ingestChallengeContent(supabase);
  }
  if (!only || only === 'uebungsbibliothek') {
    console.log('Ingestiere Übungsbibliothek …');
    await ingestUebungsbibliothek(supabase);
  }
  if (!only || only === 'trainingsplan') {
    console.log('Ingestiere Trainingspläne (aus der DB) …');
    await ingestTrainingsplaeneAusDb(supabase);
  }
  if (!only || only === 'pdf') {
    await ingestPdfs(supabase);
  }
  console.log('Fertig.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// Cron: täglich (siehe vercel.json) — zwei Nudges pro Teilnehmer:
// 1) "checkin_reminder": Tag, an dem der Check-in für die laufende Woche
//    aufgeht (Sonntag), falls noch nicht abgegeben.
// 2) "checkin_reminder_2": 48h nach Öffnung der VORHERIGEN Woche, falls die
//    immer noch nicht abgegeben ist (Nachfass — Nachholen bleibt dank
//    Catch-up-Feature jederzeit möglich, daher nur ein einmaliger Nudge,
//    kein Dauer-Spam für alte Lücken).
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getChallengeSchedule } from '@/lib/challengeSchedule';
import { sendCheckinReminderEmail, sendCheckinReminderEmail2 } from '@/lib/email';

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

  const { data: teilnahmen, error: teilnahmenError } = await supabase
    .from('challenge_teilnahmen')
    .select('id, user_id, gestartet_at, challenges ( id, name, start_datum, wochen_anzahl, studios ( name ) )')
    .eq('status', 'aktiv');

  if (teilnahmenError) {
    console.error('Cron: Teilnahmen-Lookup fehlgeschlagen:', teilnahmenError);
    return NextResponse.json({ error: 'Teilnahmen konnten nicht geladen werden.' }, { status: 500 });
  }
  if (!teilnahmen || teilnahmen.length === 0) {
    return NextResponse.json({ ok: true, geprueft: 0, gesendet: 0 }, { status: 200 });
  }

  const userIds = Array.from(new Set(teilnahmen.map((t) => t.user_id)));
  const teilnahmeIds = teilnahmen.map((t) => t.id);

  const [{ data: profiles }, { data: checkins }, { data: emailLogRows }] = await Promise.all([
    supabase.from('profiles').select('id, vorname, email').in('id', userIds),
    supabase.from('wochencheckins').select('teilnahme_id, woche').in('teilnahme_id', teilnahmeIds),
    supabase
      .from('email_log')
      .select('empfaenger_id, typ, woche')
      .in('empfaenger_id', userIds)
      .in('typ', ['checkin_reminder', 'checkin_reminder_2']),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p as { id: string; vorname: string; email: string }]));
  const submitted = new Set((checkins ?? []).map((c) => `${c.teilnahme_id}:${c.woche}`));
  const alreadyLogged = new Set((emailLogRows ?? []).map((e) => `${e.empfaenger_id}:${e.typ}:${e.woche}`));

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  let gesendet = 0;
  const fehler: string[] = [];

  for (const t of teilnahmen) {
    const challenge = Array.isArray(t.challenges) ? t.challenges[0] : t.challenges;
    if (!challenge?.start_datum) continue;

    const profile = profileById.get(t.user_id);
    if (!profile?.email) continue;

    const studio = Array.isArray(challenge.studios) ? challenge.studios[0] : challenge.studios;
    const studioName = studio?.name ?? 'MoveIn8';

    const startAnchor = t.gestartet_at ?? challenge.start_datum;
    const schedule = getChallengeSchedule(startAnchor, challenge.wochen_anzahl ?? 8);
    const currentWeek = schedule.currentWeek;

    // 1) Öffnungstag-Nudge für die laufende Woche.
    if (
      schedule.checkinUnlocked &&
      !submitted.has(`${t.id}:${currentWeek}`) &&
      !alreadyLogged.has(`${t.user_id}:checkin_reminder:${currentWeek}`)
    ) {
      try {
        await sendCheckinReminderEmail({
          to: profile.email,
          vorname: profile.vorname,
          woche: currentWeek,
          studioName,
          durchgangName: challenge.name,
        });
        await supabase.from('email_log').insert({
          empfaenger_id: t.user_id,
          empfaenger_email: profile.email,
          typ: 'checkin_reminder',
          woche: currentWeek,
          challenge_id: challenge.id,
        });
        gesendet += 1;
      } catch (err) {
        fehler.push(`${profile.email} (reminder w${currentWeek}): ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // 2) 48h-Nachfass für die vorherige Woche.
    if (currentWeek > 1) {
      const prevWeek = currentWeek - 1;
      const prevSonntag = new Date(schedule.checkinUnlockDate);
      prevSonntag.setDate(prevSonntag.getDate() - 7);
      const daysSince = Math.round((todayMidnight.getTime() - prevSonntag.getTime()) / 86_400_000);

      if (
        daysSince === 2 &&
        !submitted.has(`${t.id}:${prevWeek}`) &&
        !alreadyLogged.has(`${t.user_id}:checkin_reminder_2:${prevWeek}`)
      ) {
        try {
          await sendCheckinReminderEmail2({
            to: profile.email,
            vorname: profile.vorname,
            woche: prevWeek,
            studioName,
            durchgangName: challenge.name,
          });
          await supabase.from('email_log').insert({
            empfaenger_id: t.user_id,
            empfaenger_email: profile.email,
            typ: 'checkin_reminder_2',
            woche: prevWeek,
            challenge_id: challenge.id,
          });
          gesendet += 1;
        } catch (err) {
          fehler.push(`${profile.email} (reminder2 w${prevWeek}): ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }
  }

  if (fehler.length > 0) console.error('Cron checkin-reminders Fehler:', fehler);

  return NextResponse.json({ ok: true, geprueft: teilnahmen.length, gesendet, fehler }, { status: 200 });
}

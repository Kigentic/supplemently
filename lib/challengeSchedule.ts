// Wochen-Freischaltung: neue Woche startet immer Montag (kalenderausgerichtet,
// unabhängig vom exakten Wochentag der Registrierung/challenge.start_datum).
// Check-in für die laufende Woche ist erst ab Sonntag aktiv.

export interface ChallengeSchedule {
  /** 1-basiert, geclamped auf [1, wochenAnzahl] */
  currentWeek: number;
  /** 0=Montag ... 6=Sonntag */
  dayInWeek: number;
  /** Check-in für currentWeek darf abgeschickt werden (Sonntag der laufenden Woche) */
  checkinUnlocked: boolean;
  /** Montag der aktuellen Woche */
  weekStartDate: Date;
  /** Der Sonntag, ab dem der Check-in für die laufende Woche freigeschaltet ist */
  checkinUnlockDate: Date;
}

function mondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=So,1=Mo,...,6=Sa
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function getChallengeSchedule(
  startDatum: string | Date,
  wochenAnzahl: number,
  now: Date = new Date()
): ChallengeSchedule {
  const week1Monday = mondayOf(new Date(startDatum));
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const daysSinceWeek1Monday = Math.floor((today.getTime() - week1Monday.getTime()) / 86_400_000);
  const rawWeek = Math.floor(daysSinceWeek1Monday / 7) + 1;
  const currentWeek = Math.min(wochenAnzahl, Math.max(1, rawWeek));

  // dayInWeek nur sinnvoll für die tatsächlich laufende (nicht geclampte) Woche.
  const dayInWeek = ((daysSinceWeek1Monday % 7) + 7) % 7;
  const checkinUnlocked = rawWeek === currentWeek && dayInWeek >= 6;

  const weekStartDate = new Date(week1Monday);
  weekStartDate.setDate(weekStartDate.getDate() + (currentWeek - 1) * 7);

  const checkinUnlockDate = new Date(weekStartDate);
  checkinUnlockDate.setDate(checkinUnlockDate.getDate() + 6);

  return { currentWeek, dayInWeek, checkinUnlocked, weekStartDate, checkinUnlockDate };
}

const WOCHENTAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

export function formatUnlockDate(date: Date): string {
  const wd = WOCHENTAGE[(date.getDay() + 6) % 7];
  return `${wd}, ${date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}`;
}

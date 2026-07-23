// Zentrale Wochen-/Habit-Daten der 8-Wochen-Challenge.
// Genutzt von ChallengeWeeksOverview (Dashboard) und dem Wochen-Check-in.
import {
  IconCompass,
  IconSalad,
  IconRun,
  IconMoon,
  IconBrain,
  IconLeaf,
  IconTrendingUp,
  IconStar,
  type Icon as TablerIcon,
} from '@tabler/icons-react';

export interface ChallengeWeek {
  num: number;
  color: string;
  textColor: string;
  icon: TablerIcon;
  theme: string;
  motto: string;
  habits: string[];
  pillars: string[];
}

export const CHALLENGE_WEEKS: ChallengeWeek[] = [
  {
    num: 1,
    color: '#1D9E75',
    textColor: '#E1F5EE',
    icon: IconCompass,
    theme: 'Fundament',
    motto: 'Orientierung schaffen – dein Ausgangspunkt',
    habits: [
      'KI-Supplement-Fragebogen ausfüllen → persönliche Empfehlung erhalten',
      'Ernährungs-App einrichten & erste 3 Tage tracken',
      '2,5 L Wasser täglich trinken (Erinnerungen stellen)',
      'Tagesschritte erfassen – Baseline bestimmen',
    ],
    pillars: ['§20 App', 'Supplements', 'Hydration'],
  },
  {
    num: 2,
    color: '#639922',
    textColor: '#EAF3DE',
    icon: IconSalad,
    theme: 'Gesunde Ernährung',
    motto: 'Was du isst, macht den Unterschied',
    habits: [
      'Alle Mahlzeiten täglich in der App loggen',
      'Jede Mahlzeit mit 20–30 g Protein starten',
      '1 ultra-verarbeitetes Produkt durch Vollwertkost ersetzen',
      'Sonntag: 30 Min. Meal-Prep für die Woche',
    ],
    pillars: ['§20 App', 'Ernährung'],
  },
  {
    num: 3,
    color: '#D85A30',
    textColor: '#FAECE7',
    icon: IconRun,
    theme: 'Bewegung & Mobility',
    motto: 'Bewegung ist die günstigste Medizin der Welt',
    habits: [
      '3× Training pro Woche (Home oder Studio, 30–45 Min.)',
      'Täglich 8.000 Schritte',
      '10 Min. Mobility/Stretching täglich – morgens oder abends',
    ],
    pillars: ['Training', 'Mobility'],
  },
  {
    num: 4,
    color: '#7F77DD',
    textColor: '#EEEDFE',
    icon: IconMoon,
    theme: 'Schlaf & Regeneration',
    motto: 'Schlaf ist deine stärkste Waffe',
    habits: [
      'Feste Schlaf- & Aufwachzeit (±30 Min.) einhalten',
      '60 Min. vor dem Schlafen: alle Bildschirme aus',
      'Abendroutine: 3 Dinge notieren oder 5 Min. Atemübung',
      'Schlafqualität in der App tracken',
    ],
    pillars: ['§20 App', 'Schlaf'],
  },
  {
    num: 5,
    color: '#378ADD',
    textColor: '#E6F1FB',
    icon: IconBrain,
    theme: 'Stressmanagement',
    motto: 'Ruhe ist keine Schwäche – sie ist Performance',
    habits: [
      '5 Min. Atemübung täglich (morgens, vor dem Kaffee)',
      '30 handyfreie Minuten jeden Morgen',
      '1× pro Woche Offline-Abend (kein Bildschirm ab 20 Uhr)',
      'Wöchentlichen Supplement-Selbstcheck durchführen',
    ],
    pillars: ['Stressmanagement', 'Supplements'],
  },
  {
    num: 6,
    color: '#BA7517',
    textColor: '#FAEEDA',
    icon: IconLeaf,
    theme: 'Verdauung & Darmgesundheit',
    motto: 'Dein Darm ist dein zweites Gehirn',
    habits: [
      'Täglich fermentierte Lebensmittel (Joghurt, Kefir, Sauerkraut)',
      'Mahlzeiten bewusst langsam essen: mind. 15–20 Min.',
      'Ballaststoffziel in der App tracken: 30 g täglich',
      'Morgenritual: 1 Glas warmes Wasser + Zitrone vor dem Frühstück',
    ],
    pillars: ['§20 App', 'Verdauung'],
  },
  {
    num: 7,
    color: '#D4537E',
    textColor: '#FBEAF0',
    icon: IconTrendingUp,
    theme: 'Level Up – Intensivierung',
    motto: 'Jetzt zeigt sich, wer du geworden bist',
    habits: [
      'Training auf 4× pro Woche steigern',
      'KI-Supplement-Fragebogen erneut ausfüllen → Empfehlung anpassen',
      'Body-Check: Fotos, Maße & Gewicht dokumentieren',
      'Neues Rezept aus der App ausprobieren',
    ],
    pillars: ['Training', 'Supplements', '§20 App'],
  },
  {
    num: 8,
    color: '#888780',
    textColor: '#F1EFE8',
    icon: IconStar,
    theme: 'Dein neues Normal',
    motto: 'Das ist nicht das Ende – das ist dein Neustart',
    habits: [
      'Habit-Audit: Was bleibt, was wird angepasst, was fällt weg?',
      'Ergebnisse festhalten: Vorher/Nachher & App-Auswertung',
      'Langzeit-Supplementplan mit KI-Ratgeber erstellen',
      'Nächste 8 Wochen planen & neue Ziele setzen',
    ],
    pillars: ['Alle Pillars', 'Supplements', '§20 App'],
  },
];

export function carryForwardText(num: number): string | null {
  if (num <= 1) return null;
  const range = num === 2 ? 'Woche 1' : `Woche 1–${num - 1}`;
  return `↑ Alle Gewohnheiten aus ${range} laufen weiter`;
}

/** Stabiler Key pro Habit, z.B. "w1_h0" — wird als JSONB-Key im Check-in gespeichert. */
export function habitKey(weekNum: number, habitIndex: number): string {
  return `w${weekNum}_h${habitIndex}`;
}

/** Alle Habits von Woche 1 bis einschließlich currentWeek, gruppiert nach Woche. */
export function habitsUpTo(currentWeek: number): { week: ChallengeWeek; items: { key: string; text: string }[] }[] {
  return CHALLENGE_WEEKS.filter((w) => w.num <= currentWeek).map((week) => ({
    week,
    items: week.habits.map((text, i) => ({ key: habitKey(week.num, i), text })),
  }));
}

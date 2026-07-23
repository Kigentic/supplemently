// Zentrale Wochen-/Habit-Daten der 8-Wochen-Challenge.
// Genutzt von ChallengeWeeksOverview (Dashboard), dem Wochen-Check-in
// und den Wochen-Detailseiten (/challenge/woche/[num]).
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

export interface ChallengeHabit {
  text: string;
  /** Warum diese Gewohnheit wichtig ist — gesundheitlicher Nutzen + Motivation. */
  why: string;
}

export interface ChallengeWeek {
  num: number;
  color: string;
  textColor: string;
  icon: TablerIcon;
  theme: string;
  motto: string;
  habits: ChallengeHabit[];
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
      {
        text: 'KI-Supplement-Fragebogen ausfüllen → persönliche Empfehlung erhalten',
        why: 'Dein Supplement-Bedarf hängt von Ernährung, Training, Schlaf und persönlichen Faktoren ab — nicht von Trends. Der Fragebogen berechnet, was bei dir wirklich fehlt, statt dir ein Standardpaket zu verkaufen. Wer das überspringt, nimmt am Ende Präparate, die er nicht braucht, und lässt die aus, die wirklich etwas bringen würden.',
      },
      {
        text: 'Ernährungs-App einrichten & erste 3 Tage tracken',
        why: 'Die meisten unterschätzen ihre tägliche Kalorien- und Proteinzufuhr deutlich, ohne es zu merken. Die ersten drei Tage zeigen dir schwarz auf weiß, wo du wirklich stehst — die Basis für jede spätere Anpassung. Ohne diese Baseline optimierst du im Blindflug.',
      },
      {
        text: '2,5 L Wasser täglich trinken (Erinnerungen stellen)',
        why: 'Schon leichter Flüssigkeitsverlust senkt nachweislich Konzentration, Kraftleistung und Stimmung. Wasser reguliert außerdem Verdauung und Nährstofftransport — beides wird in den nächsten Wochen wichtig. Erinnerungen zu stellen ist kein Kindergarten, sondern der Unterschied zwischen "ich trinke genug" (gefühlt) und tatsächlich genug trinken.',
      },
      {
        text: 'Tagesschritte erfassen – Baseline bestimmen',
        why: 'Du kannst nur verbessern, was du misst. Deine aktuelle Schrittzahl ist der Ausgangspunkt für die Steigerung in Woche 5 — ohne sie weißt du nicht, ob du wirklich aktiver wirst oder es dir nur so vorkommt. Nebenbei verbrennt Alltagsbewegung bei den meisten Menschen mehr Kalorien als das Training selbst.',
      },
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
      {
        text: 'Alle Mahlzeiten täglich in der App loggen',
        why: 'Tracking ist keine Diät-Pflicht, sondern ein Bewusstseinsmacher: Allein das Aufschreiben von Mahlzeiten verbessert nachweislich das Essverhalten, unabhängig vom Ziel. Du siehst Muster, die dir sonst nie auffallen würden — z.B. wie viel du nebenbei snackst.',
      },
      {
        text: 'Jede Mahlzeit mit 20–30 g Protein starten',
        why: 'Protein sättigt am stärksten aller Makronährstoffe, hält den Blutzucker stabil und schützt Muskelmasse — besonders wichtig, wenn du gleichzeitig trainierst. Ohne ausreichend Protein baut dein Körper unter Belastung eher Muskeln ab statt Fett.',
      },
      {
        text: '1 ultra-verarbeitetes Produkt durch Vollwertkost ersetzen',
        why: 'Stark verarbeitete Lebensmittel enthalten oft versteckten Zucker und Zusatzstoffe, die Sättigung und Blutzucker aus dem Gleichgewicht bringen. Du musst nicht alles auf einmal umstellen — ein Tausch pro Tag reicht für spürbare Wirkung, ohne dass es sich wie Verzicht anfühlt.',
      },
      {
        text: 'Sonntag: 30 Min. Meal-Prep für die Woche',
        why: 'Die größte Ursache für schlechte Ernährungsentscheidungen ist nicht fehlendes Wissen, sondern fehlende Zeit im Moment des Hungers. Wer vorbereitet hat, entscheidet mit vollem statt leerem Magen — und trifft dann automatisch bessere Entscheidungen.',
      },
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
      {
        text: '3× Training pro Woche (Home oder Studio, 30–45 Min.)',
        why: 'Krafttraining ist der stärkste Hebel gegen altersbedingten Muskelabbau und verbessert Insulinsensitivität, Knochendichte und Stoffwechsel. Drei Einheiten pro Woche reichen für spürbare Fortschritte, ohne dass die Regeneration zu kurz kommt.',
      },
      {
        text: 'Täglich 8.000 Schritte',
        why: 'Studien verknüpfen rund 8.000 Schritte täglich mit einer deutlich reduzierten Gesamtsterblichkeit — unabhängig vom Trainingsprogramm. Gehen ist die Bewegungsform mit dem besten Aufwand-Nutzen-Verhältnis, die dein Körper nie "zu viel" wird.',
      },
      {
        text: '10 Min. Mobility/Stretching täglich – morgens oder abends',
        why: 'Bewegliche Gelenke reduzieren Verletzungsrisiko, verbessern Trainingsqualität und wirken aktiv gegen Verspannungen aus Sitzen und einseitiger Belastung. Zehn Minuten am Tag wirken nur, wenn sie regelmäßig passieren — nicht einmal pro Woche für eine Stunde.',
      },
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
      {
        text: 'Feste Schlaf- & Aufwachzeit (±30 Min.) einhalten',
        why: 'Deine innere Uhr steuert Hormonhaushalt, Regeneration und Energielevel. Ein fester Rhythmus — auch am Wochenende — sorgt für tieferen, effizienteren Schlaf als die gleiche Stundenzahl zu wechselnden Zeiten.',
      },
      {
        text: '60 Min. vor dem Schlafen: alle Bildschirme aus',
        why: 'Blaues Licht von Bildschirmen unterdrückt die Melatonin-Produktion und verzögert das Einschlafen messbar. Die letzte Stunde ohne Bildschirm ist einer der wirksamsten Hebel für besseren Schlaf — wirksamer als die meisten Schlaf-Supplements.',
      },
      {
        text: 'Abendroutine: 3 Dinge notieren oder 5 Min. Atemübung',
        why: 'Grübeln im Bett ist einer der häufigsten Gründe fürs Nicht-Einschlafen-Können. Das bewusste "Auslagern" von Gedanken aufs Papier oder eine kurze Atemübung senken nachweislich die Einschlafzeit.',
      },
      {
        text: 'Schlafqualität in der App tracken',
        why: 'Wie beim Essen gilt: was du misst, kannst du verbessern. Schlaftracking zeigt dir, welche deiner neuen Gewohnheiten wirklich wirken — und motiviert, wenn du siehst, dass sich etwas verbessert.',
      },
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
      {
        text: '5 Min. Atemübung täglich (morgens, vor dem Kaffee)',
        why: 'Bewusste, langsame Atmung aktiviert den "Ruhe-Nerv" (Parasympathikus) und senkt Stresshormone messbar innerhalb weniger Minuten. Fünf Minuten morgens setzen den Ton für den ganzen Tag — bevor sich Stress überhaupt aufbaut.',
      },
      {
        text: '30 handyfreie Minuten jeden Morgen',
        why: 'Der erste Griff zum Handy überflutet dein Gehirn sofort mit fremden Reizen und Dringlichkeiten, bevor du selbst entschieden hast, worauf du dich konzentrierst. Eine handyfreie Morgenroutine schützt deine mentale Energie für den Tag.',
      },
      {
        text: '1× pro Woche Offline-Abend (kein Bildschirm ab 20 Uhr)',
        why: 'Chronische Reizüberflutung durch Bildschirme erhöht nachweislich Stresslevel und stört die Schlafqualität. Ein bewusster Abend ohne Screens gibt deinem Nervensystem die Erholung, die es sonst selten bekommt.',
      },
      {
        text: 'Wöchentlichen Supplement-Selbstcheck durchführen',
        why: 'Dein Bedarf verändert sich mit Trainingsintensität, Stress und Jahreszeit. Ein kurzer wöchentlicher Check stellt sicher, dass dein Stack noch zu deinem aktuellen Zustand passt statt zu dem von vor fünf Wochen.',
      },
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
      {
        text: 'Täglich fermentierte Lebensmittel (Joghurt, Kefir, Sauerkraut)',
        why: 'Fermentierte Lebensmittel liefern lebende Bakterienkulturen, die dein Mikrobiom diversifizieren. Ein diverses Mikrobiom wird mit besserer Verdauung, stärkerem Immunsystem und sogar besserer Stimmung in Verbindung gebracht — über die Darm-Hirn-Achse.',
      },
      {
        text: 'Mahlzeiten bewusst langsam essen: mind. 15–20 Min.',
        why: 'Dein Sättigungssignal braucht rund 20 Minuten, um beim Gehirn anzukommen. Wer schneller isst, isst automatisch mehr, bevor das Sättigungsgefühl überhaupt einsetzt — und belastet zusätzlich die Verdauung.',
      },
      {
        text: 'Ballaststoffziel in der App tracken: 30 g täglich',
        why: 'Ballaststoffe füttern die guten Darmbakterien, regulieren den Blutzucker und sorgen für Sättigung. Die meisten Menschen erreichen nur die Hälfte des empfohlenen Werts — mit spürbaren Folgen für Verdauung und Energielevel.',
      },
      {
        text: 'Morgenritual: 1 Glas warmes Wasser + Zitrone vor dem Frühstück',
        why: 'Warmes Wasser regt die Verdauungstätigkeit direkt nach dem Aufwachen an, die Zitrone liefert zusätzlich Vitamin C. Kein Wundermittel, aber ein einfacher, konsistenter Start, der den restlichen Tag positiv beeinflusst.',
      },
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
      {
        text: 'Training auf 4× pro Woche steigern',
        why: 'Nach sechs Wochen Gewöhnung ist dein Körper bereit für mehr Trainingsreiz — genau der richtige Zeitpunkt, um die Intensität zu steigern, bevor sich ein Plateau einstellt.',
      },
      {
        text: 'KI-Supplement-Fragebogen erneut ausfüllen → Empfehlung anpassen',
        why: 'Dein Profil hat sich in sechs Wochen verändert — anderes Trainingslevel, andere Ernährung, vielleicht anderer Schlaf. Eine erneute Auswertung stellt sicher, dass deine Supplementierung mit deinem Fortschritt mitwächst statt stehen zu bleiben.',
      },
      {
        text: 'Body-Check: Fotos, Maße & Gewicht dokumentieren',
        why: 'Die Waage zeigt nur einen Bruchteil der Wahrheit. Fotos und Maße machen Veränderungen sichtbar, die sich in den ersten Wochen oft nicht in Kilogramm ausdrücken — Muskelaufbau bei gleichzeitigem Fettabbau zum Beispiel.',
      },
      {
        text: 'Neues Rezept aus der App ausprobieren',
        why: 'Abwechslung ist der beste Schutz gegen Ernährungs-Langeweile — die Hauptursache dafür, dass Menschen nach ein paar Wochen wieder in alte Muster zurückfallen.',
      },
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
      {
        text: 'Habit-Audit: Was bleibt, was wird angepasst, was fällt weg?',
        why: 'Nicht jede Gewohnheit muss für immer bleiben — aber die, die bleiben, solltest du bewusst wählen statt zufällig weiterzuführen. Ein ehrlicher Rückblick zeigt, was wirklich einen Unterschied gemacht hat.',
      },
      {
        text: 'Ergebnisse festhalten: Vorher/Nachher & App-Auswertung',
        why: 'Dein Gedächtnis passt sich schnell an neue Normalität an und vergisst, wie du dich vor acht Wochen gefühlt hast. Der direkte Vergleich macht sichtbar, was sich wirklich verändert hat — und ist der stärkste Motivator, weiterzumachen.',
      },
      {
        text: 'Langzeit-Supplementplan mit KI-Ratgeber erstellen',
        why: 'Die Challenge endet, dein Körper braucht aber weiterhin, was er in acht Wochen als hilfreich identifiziert hat. Ein Langzeitplan verhindert, dass du nach dem Ende wieder bei null anfängst.',
      },
      {
        text: 'Nächste 8 Wochen planen & neue Ziele setzen',
        why: 'Nachhaltige Veränderung entsteht nicht durch ein einmaliges Programm, sondern durch wiederholte Zyklen mit neuen, leicht gesteigerten Zielen. Wer jetzt weiterplant, verhindert den größten Rückfall-Trigger: das Gefühl, "fertig" zu sein.',
      },
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
    items: week.habits.map((h, i) => ({ key: habitKey(week.num, i), text: h.text })),
  }));
}

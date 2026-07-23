// 8-Wochen Challenge Übersicht — wiederverwendbare Komponente.
// Wochenfarben sind bewusst hartkodierte Hex-Werte (kein Dark-Mode-Invert).
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

interface Week {
  num: number;
  color: string;
  textColor: string;
  icon: TablerIcon;
  theme: string;
  motto: string;
  habits: string[];
  pillars: string[];
}

const WEEKS: Week[] = [
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

function carryForwardText(num: number): string | null {
  if (num <= 1) return null;
  const range = num === 2 ? 'Woche 1' : `Woche 1–${num - 1}`;
  return `↑ Alle Gewohnheiten aus ${range} laufen weiter`;
}

function WeekCard({ week, isCurrent }: { week: Week; isCurrent: boolean }) {
  const Icon = week.icon;
  const carry = carryForwardText(week.num);

  return (
    <div
      className={`flex overflow-hidden rounded-xl border-[0.5px] border-outline bg-surface ${
        isCurrent ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg' : ''
      }`}
    >
      <div
        className="flex min-w-[52px] w-[52px] flex-shrink-0 flex-col items-center justify-center gap-1"
        style={{ backgroundColor: week.color }}
      >
        <Icon size={18} stroke={1.75} color={week.textColor} aria-hidden="true" />
        <span className="text-[22px] font-medium leading-none" style={{ color: week.textColor }}>
          {week.num}
        </span>
      </div>

      <div className="min-w-0 flex-1 px-4 py-3.5">
        <p className="text-[15px] font-medium text-text">{week.theme}</p>
        <p className="mt-0.5 text-[12px] italic text-text-muted">{week.motto}</p>

        <ul className="mt-2.5 space-y-1.5">
          {week.habits.map((habit) => (
            <li key={habit} className="flex items-start gap-2 text-[13px] leading-snug text-text-muted">
              <span
                className="mt-1.5 h-[5px] w-[5px] flex-shrink-0 rounded-full"
                style={{ backgroundColor: week.color }}
                aria-hidden="true"
              />
              {habit}
            </li>
          ))}
        </ul>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {week.pillars.map((pillar) => (
            <span
              key={pillar}
              className="rounded-md border-[0.5px] border-outline bg-outline/10 px-2 py-0.5 text-[11px] text-text-muted"
            >
              {pillar}
            </span>
          ))}
        </div>

        {carry && (
          <p className="mt-3 border-t-[0.5px] border-outline pt-2.5 text-[11px] text-text-muted">
            {carry}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ChallengeWeeksOverview({ currentWeek }: { currentWeek?: number }) {
  return (
    <section aria-label="8-Wochen Challenge Übersicht">
      {/* Header */}
      <p className="mb-2 text-[11px] text-text-muted">Lifestyle Challenge · Gesundheit &amp; Longevity</p>
      <div className="mb-6 flex flex-wrap gap-2">
        <span className="rounded-md border-[0.5px] border-accent/30 bg-accent/10 px-2.5 py-[3px] text-[11px] text-accent">
          §20 Ernährungs-App
        </span>
        <span className="rounded-md border-[0.5px] border-accent/30 bg-accent/10 px-2.5 py-[3px] text-[11px] text-accent">
          KI-Supplementratgeber
        </span>
      </div>

      {/* Wochen-Strip */}
      <div className="mb-6 flex items-center">
        <div className="flex gap-1" aria-hidden="true">
          {WEEKS.map((w) => (
            <div
              key={w.num}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-md text-[13px] font-medium"
              style={{ backgroundColor: w.color, color: w.textColor }}
            >
              {w.num}
            </div>
          ))}
        </div>
        <div className="ml-1.5 h-px flex-1 border-t-[0.5px] border-accent/40" />
        <span className="ml-2 whitespace-nowrap text-[11px] text-text-muted">progressiv aufbauend</span>
      </div>

      {/* Wochen-Cards */}
      <div className="flex flex-col gap-2">
        {WEEKS.map((week) => (
          <WeekCard key={week.num} week={week} isCurrent={week.num === currentWeek} />
        ))}
      </div>
    </section>
  );
}

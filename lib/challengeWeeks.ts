// Wochen-/Habit-Daten der Challenge — seit Plan B (Schritt 4, siehe
// GAMEPLAN_B2B_CHALLENGE_PLATFORM.md) aus der DB geladen statt hartkodiert,
// damit mehrere Challenge-Typen (Longevity, später Rücken/Abnehmen/...)
// denselben Code nutzen können. Die TS-Interfaces sind bewusst unverändert
// geblieben (bis auf icon → icon_name), damit Konsumenten nur die Datenquelle
// austauschen mussten, nicht ihre Logik.
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
import type { SupabaseClient } from '@supabase/supabase-js';

export const LONGEVITY_CHALLENGE_TYP_SLUG = 'longevity-lifestyle';

/** String-Referenz statt React-Komponente in der DB — Auflösung über ICON_MAP. */
export const ICON_MAP: Record<string, TablerIcon> = {
  IconCompass,
  IconSalad,
  IconRun,
  IconMoon,
  IconBrain,
  IconLeaf,
  IconTrendingUp,
  IconStar,
};

export interface HabitExercise {
  name: string;
  dauer: string;
  hinweis?: string;
}

export interface AnleitungsVariante {
  titel: string;
  uebungen: HabitExercise[];
}

export interface ChallengeHabit {
  text: string;
  /** Warum diese Gewohnheit wichtig ist — gesundheitlicher Nutzen + Motivation. */
  why: string;
  /** Konkrete Ausführungsanleitung fürs "So geht's"-Popup, mehrere Varianten zur Rotation. */
  anleitungVarianten?: AnleitungsVariante[];
}

export interface ChallengeWeek {
  num: number;
  color: string;
  textColor: string;
  icon_name: string;
  theme: string;
  motto: string;
  habits: ChallengeHabit[];
  pillars: string[];
}

interface UebungRow {
  name: string;
  dauer: string;
  hinweis: string | null;
  sort_order: number;
}

interface AnleitungRow {
  titel: string;
  sort_order: number;
  challenge_typ_habit_uebungen: UebungRow[];
}

interface HabitRow {
  text: string;
  why: string;
  sort_order: number;
  challenge_typ_habit_anleitungen: AnleitungRow[];
}

interface WocheRow {
  woche_nummer: number;
  theme: string;
  motto: string | null;
  color: string;
  text_color: string;
  icon_name: string;
  pillars: string[];
  challenge_typ_habits: HabitRow[];
}

/** Lädt den kompletten Wochen-/Habit-Baum eines Challenge-Typs aus der DB. */
export async function fetchChallengeWeeks(
  supabase: SupabaseClient,
  challengeTypId: string
): Promise<ChallengeWeek[]> {
  const { data, error } = await supabase
    .from('challenge_typ_wochen')
    .select(
      `woche_nummer, theme, motto, color, text_color, icon_name, pillars,
       challenge_typ_habits (
         text, why, sort_order,
         challenge_typ_habit_anleitungen (
           titel, sort_order,
           challenge_typ_habit_uebungen ( name, dauer, hinweis, sort_order )
         )
       )`
    )
    .eq('challenge_typ_id', challengeTypId);

  if (error) throw new Error(`Challenge-Wochen konnten nicht geladen werden: ${error.message}`);

  const rows = (data ?? []) as unknown as WocheRow[];

  return rows
    .map((w): ChallengeWeek => ({
      num: w.woche_nummer,
      color: w.color,
      textColor: w.text_color,
      icon_name: w.icon_name,
      theme: w.theme,
      motto: w.motto ?? '',
      pillars: w.pillars,
      habits: [...w.challenge_typ_habits]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((h): ChallengeHabit => ({
          text: h.text,
          why: h.why,
          anleitungVarianten:
            h.challenge_typ_habit_anleitungen.length > 0
              ? [...h.challenge_typ_habit_anleitungen]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((a): AnleitungsVariante => ({
                    titel: a.titel,
                    uebungen: [...a.challenge_typ_habit_uebungen]
                      .sort((x, y) => x.sort_order - y.sort_order)
                      .map((u): HabitExercise => ({
                        name: u.name,
                        dauer: u.dauer,
                        hinweis: u.hinweis ?? undefined,
                      })),
                  }))
              : undefined,
        })),
    }))
    .sort((a, b) => a.num - b.num);
}

/** Auflösung von challenge_typ_id über den Slug — Startpunkt für Konsumenten ohne eigenen Challenge-Kontext. */
export async function fetchChallengeTypIdBySlug(supabase: SupabaseClient, slug: string): Promise<string | null> {
  const { data } = await supabase.from('challenge_typen').select('id').eq('slug', slug).maybeSingle();
  return data?.id ?? null;
}

export function carryForwardText(num: number): string | null {
  if (num <= 1) return null;
  const range = num === 2 ? 'Woche 1' : `Woche 1–${num - 1}`;
  return `↑ Alle Gewohnheiten aus ${range} laufen weiter`;
}

/** Stabiler Key pro Habit, z.B. "w1_h0" — wird als JSONB-Key im Check-in gespeichert. */
export function habitKey(weekNum: number, habitIndex: number): string {
  return `w${weekNum}_h${habitIndex}`;
}

/**
 * Wählt die anzuzeigende Anleitungs-Variante für einen Habit mit mehreren Varianten.
 * Rotiert nach der aktuell betrachteten Woche, damit dieselbe Gewohnheit (per Carry-Forward)
 * nicht wochenlang exakt dieselbe Anleitung zeigt. Bei nur einer Variante (z.B. Atemübungen,
 * bewusst fix zugeordnet) gibt es immer dieselbe zurück.
 */
export function pickAnleitungsVariante(
  varianten: AnleitungsVariante[],
  contextWeek: number
): AnleitungsVariante {
  return varianten[contextWeek % varianten.length];
}

/** Alle Habits von Woche 1 bis einschließlich currentWeek, gruppiert nach Woche. */
export function habitsUpTo(
  weeks: ChallengeWeek[],
  currentWeek: number
): { week: ChallengeWeek; items: { key: string; text: string; anleitungVarianten?: AnleitungsVariante[] }[] }[] {
  return weeks
    .filter((w) => w.num <= currentWeek)
    .map((week) => ({
      week,
      items: week.habits.map((h, i) => ({
        key: habitKey(week.num, i),
        text: h.text,
        anleitungVarianten: h.anleitungVarianten,
      })),
    }));
}

// Zuordnung eines Teilnehmers zu seinem Trainingsplan: Geschlecht + Level
// (direkt aus dem Onboarding-Fragebogen) + Fokus (Onboarding, im Check-in
// überschreibbar) → eine Zeile in trainingsplan_zuordnung. Reine
// Nachschlagetabelle, keine Berechnung — siehe Konzept in der Session.

export type TrainingsplanGeschlecht = 'maennlich' | 'weiblich';
export type TrainingsplanLevel = 'beginner' | 'leicht_aktiv' | 'regelmaessig' | 'intensiv';
export type TrainingsplanFokus = 'kein' | 'ruecken' | 'beine_po' | 'bauch_core' | 'fatburn';
export type TrainingsplanOrt = 'studio' | 'zuhause';

export function mapOrt(ort: string | null | undefined): TrainingsplanOrt {
  return ort === 'zuhause' ? 'zuhause' : 'studio';
}

export function mapGeschlecht(geschlecht: string | null | undefined): TrainingsplanGeschlecht {
  return geschlecht === 'weiblich' ? 'weiblich' : 'maennlich';
}

// Onboarding-Rohwerte ('keine'|'gelegentlich'|'regelmaessig'|'intensiv')
// entsprechen 1:1 den Trainingsplan-Leveln (nur 'keine' → 'beginner' benannt).
export function mapTrainingslevel(trainingslevel: string | null | undefined): TrainingsplanLevel {
  switch (trainingslevel) {
    case 'gelegentlich':
      return 'leicht_aktiv';
    case 'regelmaessig':
      return 'regelmaessig';
    case 'intensiv':
      return 'intensiv';
    default:
      return 'beginner';
  }
}

export function mapFokus(fokus: string | null | undefined): TrainingsplanFokus {
  return fokus === 'ruecken' || fokus === 'beine_po' || fokus === 'bauch_core' || fokus === 'fatburn' ? fokus : 'kein';
}

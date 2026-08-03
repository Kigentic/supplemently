// Zuordnung eines Teilnehmers zu seinem Trainingsplan: Geschlecht + gemapptes
// Trainingslevel (aus dem Onboarding-Fragebogen) + Phase (Woche 1-4 / 5-8).
// Rotationsvariante ist deterministisch pro User (kein dynamisches
// Neuberechnen), siehe Konzept in der Session.

export type TrainingsplanGeschlecht = 'maennlich' | 'weiblich';
export type TrainingsplanLevel = 'beginner' | 'fortgeschritten' | 'advanced';

export function mapGeschlecht(geschlecht: string | null | undefined): TrainingsplanGeschlecht {
  return geschlecht === 'weiblich' ? 'weiblich' : 'maennlich';
}

export function mapTrainingslevel(trainingslevel: string | null | undefined): TrainingsplanLevel {
  switch (trainingslevel) {
    case 'intensiv':
      return 'advanced';
    case 'gelegentlich':
    case 'regelmaessig':
      return 'fortgeschritten';
    default:
      return 'beginner';
  }
}

export function phaseForWeek(currentWeek: number): 1 | 2 {
  return currentWeek <= 4 ? 1 : 2;
}

/** Stabile 1|2-Auswahl pro User — kein Zufall, kein Neuberechnen bei jedem Aufruf. */
export function variantForUser(userId: string): 1 | 2 {
  let sum = 0;
  for (let i = 0; i < userId.length; i++) sum += userId.charCodeAt(i);
  return sum % 2 === 0 ? 1 : 2;
}

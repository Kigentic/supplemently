// Seed der kanonischen Übungsbibliothek (Standard-Übungen + Geräte-Varianten).
// Aufruf: npm run seed:uebungsbibliothek — vor seed:trainingsplaene laufen
// lassen, da dieses Skript die Übungen per Name nachschlägt.
import { getServiceClient } from '../lib/supabaseServer';

interface UebungSeed {
  muskelgruppe: string;
  name: string;
  varianten: string;
}

const BEINE = 'Beine & Gesäß';
const BRUST = 'Brust';
const RUECKEN = 'Rücken';
const SCHULTERN = 'Schultern';
const ARME = 'Arme';
const CORE = 'Rumpf & Bauch';

const UEBUNGEN: UebungSeed[] = [
  { muskelgruppe: BEINE, name: 'Kniebeugen (Squats)', varianten: 'Mit Langhantel, Kurzhanteln, an der Multipresse oder der Hackenschmidt-Maschine.' },
  { muskelgruppe: BEINE, name: 'Beinpresse (Leg Press)', varianten: 'Geführte Grundübung für Oberschenkel und Gesäß.' },
  { muskelgruppe: BEINE, name: 'Ausfallschritte (Lunges)', varianten: 'Gehend oder auf der Stelle (mit Kurzhanteln oder Langhantel).' },
  { muskelgruppe: BEINE, name: 'Beinstrecken (Leg Extension)', varianten: 'An der Maschine für den vorderen Oberschenkel.' },
  { muskelgruppe: BEINE, name: 'Beinbeugen (Leg Curl)', varianten: 'An der Maschine (sitzend oder liegend) für den hinteren Oberschenkel.' },
  { muskelgruppe: BEINE, name: 'Rumänisches Kreuzheben (RDL)', varianten: 'Für Beinbeuger und Gesäß (mit Kurz- oder Langhantel).' },
  { muskelgruppe: BEINE, name: 'Hip Thrusts / Beckenheben', varianten: 'Mit Langhantel, Kurzhantel oder an der Hip-Thrust-Maschine für das Gesäß.' },
  { muskelgruppe: BEINE, name: 'Glute Kickbacks', varianten: 'Am Kabelzug, mit Anschellschlaufen oder an der Kickback-Maschine.' },
  { muskelgruppe: BEINE, name: 'Wadenheben stehend', varianten: 'Mit Kurzhantel, an der Multipresse oder der Wadenmaschine.' },
  { muskelgruppe: BEINE, name: 'Wadenheben sitzend', varianten: 'Speziell an der Wadenmaschine oder mit Kurzhanteln auf den Knien.' },
  { muskelgruppe: BEINE, name: 'Adduktion', varianten: 'An der Adduktoren-Maschine oder am Kabelzug (Oberschenkelinnenseite).' },
  { muskelgruppe: BEINE, name: 'Abduktion', varianten: 'An der Abduktoren-Maschine, mit Minibändern oder am Kabelzug (Oberschenkelaußenseite).' },

  { muskelgruppe: BRUST, name: 'Bankdrücken (Flachbank)', varianten: 'Mit Langhantel, Kurzhanteln, am Kabelzug oder an der Brustpresse.' },
  { muskelgruppe: BRUST, name: 'Schrägbankdrücken', varianten: 'Fokus auf die obere Brust (mit Kurz-, Langhantel oder Maschine).' },
  { muskelgruppe: BRUST, name: 'Negativbankdrücken', varianten: 'Fokus auf die untere Brust (mit Lang- oder Kurzhanteln).' },
  { muskelgruppe: BRUST, name: 'Flyes / Fliegende', varianten: 'An der Butterfly-Maschine, mit Kurzhanteln auf der Bank oder am Kabelzug.' },
  { muskelgruppe: BRUST, name: 'Cable Crossover / Kabelziehen', varianten: 'Von oben nach unten oder unten nach oben für unterschiedliche Winkel.' },
  { muskelgruppe: BRUST, name: 'Dips', varianten: 'Am Barren, mit Zusatzgewicht, an der Dip-Maschine oder der Klimmzug-Unterstützungsstation.' },
  { muskelgruppe: BRUST, name: 'Liegestütze (Push-ups)', varianten: 'Klassisch mit Eigengewicht oder erhöht.' },

  { muskelgruppe: RUECKEN, name: 'Latzug zum Nacken / zur Brust', varianten: 'Am Latzug-Turm mit verschiedenen Griffen (breit, eng, Untergriff).' },
  { muskelgruppe: RUECKEN, name: 'Klimmzüge (Pull-ups / Chin-ups)', varianten: 'Frei an der Stange oder mit Maschinengewicht-Unterstützung.' },
  { muskelgruppe: RUECKEN, name: 'Rudern sitzend', varianten: 'Am Kabelzug (mit V-Griff, breitem Griff etc.) oder an der Rudermaschine.' },
  { muskelgruppe: RUECKEN, name: 'Vorgebeugtes Langhantelrudern', varianten: 'Klassische Freihantel-Grundübung.' },
  { muskelgruppe: RUECKEN, name: 'Einarmiges Kurzhantelrudern', varianten: 'Auf der Flachbank abgestützt.' },
  { muskelgruppe: RUECKEN, name: 'T-Bar Rudern', varianten: 'Mit der T-Bar-Stange oder an der Bruststützen-Maschine.' },
  { muskelgruppe: RUECKEN, name: 'Kreuzheben (Deadlift)', varianten: 'Mit der Langhantel für den gesamten hinteren Kettenbereich.' },
  { muskelgruppe: RUECKEN, name: 'Überzüge (Pullovers)', varianten: 'Mit einer Kurzhantel auf der Bank oder am Kabelzug (sowie Lat-Zug-Maschine).' },
  { muskelgruppe: RUECKEN, name: 'Rückenstrecken (Hyperextensions)', varianten: 'An der 45°-Rückenstrecker-Bank (optional mit Zusatzscheibe).' },

  { muskelgruppe: SCHULTERN, name: 'Schulterdrücken / Military Press', varianten: 'Im Stehen/Sitzen mit Langhantel, Kurzhanteln oder an der Schulterpresse.' },
  { muskelgruppe: SCHULTERN, name: 'Seitheben', varianten: 'Klassisch mit Kurzhanteln, am Kabelzug oder an der Seithebe-Maschine.' },
  { muskelgruppe: SCHULTERN, name: 'Frontheben', varianten: 'Mit Kurzhanteln, Hantelscheibe oder am Kabelzug.' },
  { muskelgruppe: SCHULTERN, name: 'Vorgebeugtes Seitheben', varianten: 'Für die hintere Schulter (mit Kurzhanteln oder am Kabelzug).' },
  { muskelgruppe: SCHULTERN, name: 'Face Pulls', varianten: 'Am Kabelzug mit dem Seil für hintere Schultern und Rotatorenmanschette.' },
  { muskelgruppe: SCHULTERN, name: 'Reverse Butterfly (Reverse Flyes)', varianten: 'An der Pec-Deck-Maschine für die hintere Schulter.' },
  { muskelgruppe: SCHULTERN, name: 'Nackenheben / Shrugs', varianten: 'Für den Trapezmuskel (mit Kurzhanteln oder Langhantel).' },

  { muskelgruppe: ARME, name: 'Bizepscurls', varianten: 'Mit Kurzhanteln (alternierend, Hammer-Curls), Langhantel oder SZ-Stange.' },
  { muskelgruppe: ARME, name: 'Preacher Curls / Scott-Curls', varianten: 'Auf der Curlbank mit SZ-Stange, Kurzhantel oder an der Curl-Maschine.' },
  { muskelgruppe: ARME, name: 'Konzentrationscurls', varianten: 'Im Sitzen mit der Kurzhantel am Innenschenkel.' },
  { muskelgruppe: ARME, name: 'Kabel-Curls', varianten: 'Am tiefen Kabelzug mit gerader Stange, SZ-Stange oder Seil.' },
  { muskelgruppe: ARME, name: 'Trizepsdrücken / Kabel-Pushdowns', varianten: 'Am Kabelzug mit Seil, gerader Stange oder V-Griff.' },
  { muskelgruppe: ARME, name: 'Schädelzertrümmerer (French Press)', varianten: 'Liegend mit SZ-Stange oder Kurzhanteln.' },
  { muskelgruppe: ARME, name: 'Trizeps-Kickbacks', varianten: 'Vorgebeugt mit der Kurzhantel oder am Kabelzug.' },
  { muskelgruppe: ARME, name: 'Überkopf-Trizepsdrücken', varianten: 'Im Stehen oder Sitzen mit Kurzhantel, SZ-Stange oder am Kabelzug.' },
  { muskelgruppe: ARME, name: 'Enges Bankdrücken', varianten: 'Langhanteldrücken mit engem Griff für den Trizeps.' },

  { muskelgruppe: CORE, name: 'Crunches', varianten: 'Auf der Matte, auf der Schrägbank oder an der Bauchmaschine.' },
  { muskelgruppe: CORE, name: 'Beinheben', varianten: 'Hängend an der Klimmzugstange, im Dip-Ständer oder liegend.' },
  { muskelgruppe: CORE, name: 'Plank (Unterarmstütz)', varianten: 'Statisch, dynamisch oder mit Zusatzgewicht.' },
  { muskelgruppe: CORE, name: 'Russian Twists', varianten: 'Mit Hantelscheibe, Medizinball oder Kurzhantel für die schrägen Bauchmuskeln.' },
  { muskelgruppe: CORE, name: 'Kabel-Crunches (Kneeling Cable Crunches)', varianten: 'Kniend am Kabelzug mit dem Seil.' },
  { muskelgruppe: CORE, name: 'Rumpfdrehen (Rotary Torso)', varianten: 'An der Torso-Maschine oder per Cable Woodchopper am Kabelzug.' },
  { muskelgruppe: CORE, name: 'Ab-Wheel Rollouts', varianten: 'Mit dem Bauchroller / Ab-Wheel auf dem Boden.' },
];

async function main() {
  const supabase = getServiceClient();

  for (let i = 0; i < UEBUNGEN.length; i++) {
    const u = UEBUNGEN[i];
    await supabase.from('uebungsbibliothek').delete().eq('name', u.name);
    const { error } = await supabase
      .from('uebungsbibliothek')
      .insert({ muskelgruppe: u.muskelgruppe, name: u.name, varianten: u.varianten, sort_order: i });
    if (error) throw new Error(`Konnte "${u.name}" nicht anlegen: ${error.message}`);
  }

  console.log(`Fertig: ${UEBUNGEN.length} Übungen in der Bibliothek.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

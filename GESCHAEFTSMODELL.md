# Supplemently — Geschäftsmodell

**Stand:** Oktober 2026 · **Status:** Entwurf, offene Entscheidungen unten. Zahlen und Annahmen sind markiert, was nicht belegt ist.

---

## Fokus

Zurück zum Kern: **Supplement-Beratung für Fitnessstudios.** Die 8-Wochen-Challenge (siehe `GAMEPLAN.md`) bleibt gebaut, steht aber im Hintergrund.

Das Studio soll **keinen bis minimalen Aufwand** haben. Seine Mitglieder beraten sich über das System, bekommen eine Empfehlung und kaufen. Alle Beteiligten verdienen daran.

---

## Ausgangslage Studio

- Ziele: mehr Mitglieder, mehr Umsatz.
- Personal kann weder beraten noch verkaufen. Studios kaufen deshalb gern fertige Systeme (Apps, Push, Drittanbieter), bei denen sie selbst nichts tun müssen.
- Supplements werden im Studio nicht mehr verkauft (Automaten sind Ladenhüter). Mitglieder kaufen online: Amazon, Herstellerseiten, Rabattcodes von Influencern.
- Supplements sind 2026 verstanden: nicht nur Whey, auch Magnesium, Ashwagandha, Vitamin D3, Omega-3.

→ Das Studio ist **Vertriebskanal**, nicht Verkäufer. Es leistet nur die Aktivierung (QR am Counter, App, Newsletter, WhatsApp).

---

## Referenz: Choicera

Choicera (choicera.com) verfolgt dasselbe Prinzip: Fragebogen, KI-Beratung, Produkte von Partnermarken. Choicera berät und vermittelt, Verkäufer ist immer die Marke. Studio-Anteil laut ihrem Rechner: 50 % der Marken-Provision, Anspruch erst nach Zahlungseingang. Annahme dort: 20 % Einstiegsprovision, Zielkorridor 25–30 %. Die Zahlen sind eine Modellrechnung von Choicera, keine belegten Werte.

---

## Verworfen: Amazon-Partnerprogramm

Geprüft am 21.10.2026 gegen Teilnahmevereinbarung und Programmrichtlinien (partnernet.amazon.de). Keine Rechtsberatung.

- Partner-Links mit eigenem Tag dürfen nicht auf Websites angezeigt werden, die nicht die eigene sind (Teilnahmevoraussetzungen 6 b). Ein Widget auf der Studio-Seite scheidet damit aus.
- Gegenleistungen, Belohnungen oder Anreize für die Nutzung der Links sind verboten, auch Geld (6 g). Ein Studio-Anteil an Klicks ist damit problematisch.
- Unter-Tags nur mit Amazons Zustimmung und nicht pro Endnutzer (2 b).
- Eine ausdrückliche Regel zur Provisionsteilung fehlt im gelesenen Text.
- Die Provisionssätze liegen hinter dem Partner-Login und wurden nicht geprüft.
- Rechenbeispiel (Annahme, nicht belegt): bei wenigen Prozent Provision auf 60 € Warenkorb bleiben nach Teilung ca. 1 € je Partei, abzüglich Abrechnungsaufwand.

**Entscheidung:** Amazon ist keine Einnahmequelle. Ohne Provision höchstens als neutraler Fallback-Link.

---

## Wer verdient wie? Optionen

| Option | Zahler | Vorteil | Risiko |
|---|---|---|---|
| A: Marken-Provision | Marke zahlt uns, wir teilen mit Studio | Studio zahlt nichts | Marke braucht Grund mitzumachen (Volumen), Abrechnung |
| B: Studio zahlt | Studio zahlt monatlich für das System | Planbar, keine Marke nötig | Zahlungsbereitschaft ungeprüft |
| C: Marke pro Studio | Marke zahlt für exklusiven Zugang zu einem Studio/einer Kette | Starkes Argument für die Marke | Neutralität nur in der Beratung |

### Warum sollte Marke C mitmachen?

Direkte Konkurrenten auf derselben Plattform sind kein Argument. Möglich:
1. **Exklusivität pro Studio oder Kette**, je Produktkategorie eine Partnermarke.
2. **Exklusivität pro Kategorie über die Plattform**, zeitlich begrenzt.
3. **Pay-to-play** — widerspricht der unabhängigen Produkt-Whitelist, eher nicht.

Alle Wege haben ein Henne-Ei-Problem: Marken zahlen erst, wenn Studios und Mitglieder da sind.

**Zurückgestellt:** Exklusiv-System für eine einzelne Marke (Marken als eigene Kunden).

---

## Produktlogik (unabhängig vom Erlösmodell)

- Wir kuratieren auf Produktebene: pro Supplement Form, Dosis und Reinheit festlegen, daraus eine Whitelist konkreter Produkte (siehe Memory „Supplement-Formen/Bioverfügbarkeit“).
- Der Händler ist austauschbar, mehrere Kauflinks je Produkt möglich.
- Regel für Glaubwürdigkeit: Qualität entscheidet, was auf die Whitelist kommt. Nur dort wird nach Provision gewählt.
- Prozis nur selektiv, einzelne Produkte statt ganzes Sortiment (Inhaltsstoffe teils schwach).

## Technik und Kosten

- Fragebogen und Matching sind regelbasiert: keine Token-Kosten.
- Charles (Chat) kostet Tokens: Limits je Studio und Monat nötig.
- MCP-Anbindung (Idee): Nutzer zahlt mit eigenem KI-Assistenten, wir liefern nur Daten und Matching.
- Einbettung als gehostetes Widget (Script/iframe), kein Quellcode an Studios.

---

## Offene Entscheidungen

1. Wer zahlt zuerst: Studio (B) oder Marke (A/C)? Zahlungsbereitschaft von 2–3 Studios abfragen, bevor gebaut wird.
2. Studio-Anteil bei A (Choicera: 50 %).
3. Gibt es eine konkrete Marke für einen ersten Deal?
4. Rolle der Challenge: Zusatzprodukt für Studios oder auf Eis.
5. Rechtlich: Haftung bei Supplement-Empfehlungen, Disclaimer, Kennzeichnung als Werbung bei Provisionslinks.

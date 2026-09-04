# Newsletter-Kampagne: Longevity Challenge Launch

3-teilige Launch-Kampagne für 2.500 B2C-Kontakte mit Werbeeinwilligung
(`dsgvo_marketing = true`). Ziel: Hype aufbauen, zur Registrierung unter
`/challenge/registrierung` bewegen.

## Dateien

- `mail-1-teaser.html` — Tag 0, Teaser/Hype, kein harter CTA
- `mail-2-reveal.html` — Tag 7, volle Enthüllung + Anmeldung öffnen
- `mail-3-last-call.html` — Tag 14, Dringlichkeit/FOMO, letzter Aufruf

## Vor dem Versand ausfüllen

Alle drei Dateien enthalten `[PLATZHALTER]` für:

- `[STARTDATUM]` — tatsächliches Startdatum der nächsten Kohorte
- Versandlink im CTA-Button (`https://supplemently.vercel.app/challenge/registrierung`
  ist bereits eingetragen — bei Bedarf auf die finale Produktions-URL/Domain anpassen)

## Setup-Checkliste (beliebiges ESP, z. B. Mailchimp/Klaviyo/Brevo)

1. Liste/Segment "2.500 B2C mit Werbeeinwilligung" importieren (`dsgvo_marketing = true`,
   noch nicht registriert)
2. Kampagne 1 (`mail-1-teaser.html`) sofort versenden
3. Nach 7 Tagen: Empfänger, die sich zwischenzeitlich registriert haben, aus der
   Liste entfernen, dann Kampagne 2 (`mail-2-reveal.html`) versenden
4. Nach weiteren 7 Tagen: gleiche Bereinigung, dann Kampagne 3 (`mail-3-last-call.html`)
5. Abmeldungen laufend aus der Liste nehmen (Unsubscribe-Link ist in jeder Vorlage
   als Platzhalter `{{unsubscribe_url}}` markiert — beim ESP-Import auf das
   jeweilige Merge-Tag mappen)
6. Öffnungs-/Klickrate nach jeder Mail auswerten, siehe Benchmarks im Chat-Verlauf

Volle Strategie, Betreffzeilen-Varianten, A/B-Test-Vorschläge und Flow-Diagramm
stehen im Chat, in dem diese Vorlagen erstellt wurden.

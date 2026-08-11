// Eigener Mailversand über Resend — ersetzt Supabases Standard-Auth-Mails
// (Absender "Supabase Auth", kein Branding, kein Custom-Template).
import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM_EMAIL || 'hallo@kigentic.de';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY fehlt in der Umgebung.');
  return new Resend(key);
}

function layout(bodyHtml: string, brandLabel = 'Longevity Lifestyle Challenge') {
  return `
<!DOCTYPE html>
<html lang="de">
  <body style="margin:0;padding:0;background-color:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,#4f90c1,#225990);padding:32px 40px;text-align:center;">
                <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.02em;">${escapeHtml(brandLabel)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 32px;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#959595;">
                  ${escapeHtml(brandLabel)} · Diese Mail wurde automatisch versendet.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendConfirmationEmail({
  to,
  vorname,
  confirmLink,
}: {
  to: string;
  vorname: string;
  confirmLink: string;
}) {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#707070;">Hey ${escapeHtml(vorname)} 👋</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4a4a4a;">
      Bestätige deine E-Mail-Adresse und starte in die Longevity Lifestyle Challenge —
      8 Wochen, individuell auf dich abgestimmt.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="border-radius:999px;background:linear-gradient(135deg,#4f90c1,#225990);">
          <a href="${confirmLink}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
            E-Mail bestätigen
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#959595;">
      Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br/>
      <a href="${confirmLink}" style="color:#4f90c1;word-break:break-all;">${confirmLink}</a>
    </p>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#959595;">
      Der Link ist 24 Stunden gültig. Wenn du dich nicht angemeldet hast, kannst du diese Mail ignorieren.
    </p>
  `;

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Bestätige deine E-Mail — Longevity Lifestyle Challenge',
    html: layout(body),
  });

  if (error) throw new Error(typeof error === 'string' ? error : error.message);
}

export async function sendPasswordResetEmail({
  to,
  vorname,
  resetLink,
}: {
  to: string;
  vorname: string;
  resetLink: string;
}) {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#707070;">Hey ${escapeHtml(vorname)} 👋</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4a4a4a;">
      Du hast ein neues Passwort angefordert. Klick auf den Button, um ein neues Passwort zu setzen.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="border-radius:999px;background:linear-gradient(135deg,#4f90c1,#225990);">
          <a href="${resetLink}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
            Neues Passwort setzen
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#959595;">
      Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br/>
      <a href="${resetLink}" style="color:#4f90c1;word-break:break-all;">${resetLink}</a>
    </p>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#959595;">
      Der Link ist 1 Stunde gültig. Wenn du das nicht warst, kannst du diese Mail ignorieren — dein Passwort bleibt unverändert.
    </p>
  `;

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Neues Passwort setzen — Longevity Lifestyle Challenge',
    html: layout(body),
  });

  if (error) throw new Error(typeof error === 'string' ? error : error.message);
}

export async function sendStudioConfirmationEmail({
  to,
  ansprechpartnerVorname,
  studioName,
  confirmLink,
}: {
  to: string;
  ansprechpartnerVorname: string;
  studioName: string;
  confirmLink: string;
}) {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#707070;">Hey ${escapeHtml(ansprechpartnerVorname)} 👋</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4a4a4a;">
      Fast fertig — bestätige die E-Mail-Adresse für <strong>${escapeHtml(studioName)}</strong>,
      dann kannst du dich einloggen und dein Studio verwalten.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="border-radius:999px;background:linear-gradient(135deg,#4f90c1,#225990);">
          <a href="${confirmLink}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
            E-Mail bestätigen
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#959595;">
      Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br/>
      <a href="${confirmLink}" style="color:#4f90c1;word-break:break-all;">${confirmLink}</a>
    </p>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#959595;">
      Der Link ist 24 Stunden gültig. Wenn du das nicht warst, kannst du diese Mail ignorieren.
    </p>
  `;

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Bestätige deine E-Mail — ${studioName} bei Supplemently`,
    html: layout(body, 'Supplemently für Studios'),
  });

  if (error) throw new Error(typeof error === 'string' ? error : error.message);
}

export async function sendDurchgangConfirmationEmail({
  to,
  vorname,
  studioName,
  durchgangName,
  confirmLink,
}: {
  to: string;
  vorname: string;
  studioName: string;
  durchgangName: string;
  confirmLink: string;
}) {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#707070;">Hey ${escapeHtml(vorname)} 👋</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4a4a4a;">
      Bestätige deine E-Mail-Adresse für <strong>${escapeHtml(durchgangName)}</strong> bei
      ${escapeHtml(studioName)}. Dein Studio schaltet dich nach Zahlungseingang frei — danach
      geht's direkt los.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="border-radius:999px;background:linear-gradient(135deg,#4f90c1,#225990);">
          <a href="${confirmLink}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
            E-Mail bestätigen
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#959595;">
      Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br/>
      <a href="${confirmLink}" style="color:#4f90c1;word-break:break-all;">${confirmLink}</a>
    </p>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#959595;">
      Der Link ist 24 Stunden gültig. Wenn du dich nicht angemeldet hast, kannst du diese Mail ignorieren.
    </p>
  `;

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Bestätige deine E-Mail — ${durchgangName}`,
    html: layout(body, studioName),
  });

  if (error) throw new Error(typeof error === 'string' ? error : error.message);
}

export async function sendNeueRegistrierungEmail({
  to,
  studioName,
  durchgangName,
  teilnehmerName,
  teilnehmerEmail,
}: {
  to: string;
  studioName: string;
  durchgangName: string;
  teilnehmerName: string;
  teilnehmerEmail: string;
}) {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#707070;">Neue Registrierung 🎉</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4a4a4a;">
      <strong>${escapeHtml(teilnehmerName)}</strong> (${escapeHtml(teilnehmerEmail)}) hat sich gerade
      für <strong>${escapeHtml(durchgangName)}</strong> registriert.
    </p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4a4a4a;">
      Sobald die Zahlung bei euch eingegangen ist, schaltet ihr das Mitglied in eurem
      Studio-Bereich frei — erst dann kann es die Challenge nutzen.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="border-radius:999px;background:linear-gradient(135deg,#4f90c1,#225990);">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://supplemently.vercel.app'}/challenge/admin" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
            Zum Studio-Bereich
          </a>
        </td>
      </tr>
    </table>
  `;

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Neue Registrierung — ${durchgangName}`,
    html: layout(body, studioName),
  });

  if (error) throw new Error(typeof error === 'string' ? error : error.message);
}

export async function sendFreischaltungEmail({
  to,
  vorname,
  studioName,
  durchgangName,
  empfehlungsLink,
}: {
  to: string;
  vorname: string;
  studioName: string;
  durchgangName: string;
  empfehlungsLink: string;
}) {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#707070;">Los geht's, ${escapeHtml(vorname)}! 🎉</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4a4a4a;">
      ${escapeHtml(studioName)} hat dich für <strong>${escapeHtml(durchgangName)}</strong> freigeschaltet.
      Logg dich ein und leg direkt mit deiner ersten Wochenaufgabe los.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="border-radius:999px;background:linear-gradient(135deg,#4f90c1,#225990);">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://supplemently.vercel.app'}/challenge/login" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
            Jetzt einloggen
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:28px 0 8px;font-size:15px;line-height:1.6;color:#4a4a4a;">
      Mach das doch mit einer Freundin, einem Nachbarn oder Arbeitskollegen zusammen — gemeinsam
      motiviert's doppelt so gut. Dein persönlicher Einladungslink:
    </p>
    <p style="margin:0;font-size:13px;line-height:1.6;">
      <a href="${empfehlungsLink}" style="color:#4f90c1;word-break:break-all;">${empfehlungsLink}</a>
    </p>
  `;

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Du bist freigeschaltet — ${durchgangName}`,
    html: layout(body, studioName),
  });

  if (error) throw new Error(typeof error === 'string' ? error : error.message);
}

export async function sendCheckinReminderEmail({
  to,
  vorname,
  woche,
  studioName,
  durchgangName,
}: {
  to: string;
  vorname: string;
  woche: number;
  studioName: string;
  durchgangName: string;
}) {
  const checkinLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://supplemently.vercel.app'}/challenge/checkin?woche=${woche}`;
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#707070;">Dein Check-in ist offen, ${escapeHtml(vorname)} 📋</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4a4a4a;">
      Woche ${woche} von ${escapeHtml(durchgangName)} ist rum — Zeit für deinen Wochen-Check-in.
      Ampeln setzen, kurz Feedback geben, fertig. Dauert 2 Minuten.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="border-radius:999px;background:linear-gradient(135deg,#4f90c1,#225990);">
          <a href="${checkinLink}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
            Jetzt Check-in machen
          </a>
        </td>
      </tr>
    </table>
  `;

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Check-in für Woche ${woche} ist offen`,
    html: layout(body, studioName),
  });

  if (error) throw new Error(typeof error === 'string' ? error : error.message);
}

export async function sendCheckinReminderEmail2({
  to,
  vorname,
  woche,
  studioName,
  durchgangName,
}: {
  to: string;
  vorname: string;
  woche: number;
  studioName: string;
  durchgangName: string;
}) {
  const checkinLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://supplemently.vercel.app'}/challenge/checkin?woche=${woche}`;
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#707070;">Noch nicht zu spät, ${escapeHtml(vorname)} 👀</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4a4a4a;">
      Dein Check-in für Woche ${woche} von ${escapeHtml(durchgangName)} wartet noch. Kein Stress — du kannst
      ihn jederzeit nachholen, auch wenn die Woche schon weitergelaufen ist.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="border-radius:999px;background:linear-gradient(135deg,#4f90c1,#225990);">
          <a href="${checkinLink}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
            Jetzt nachholen
          </a>
        </td>
      </tr>
    </table>
  `;

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Woche ${woche} — dein Check-in wartet noch`,
    html: layout(body, studioName),
  });

  if (error) throw new Error(typeof error === 'string' ? error : error.message);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

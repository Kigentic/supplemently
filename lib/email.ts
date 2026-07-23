// Eigener Mailversand über Resend — ersetzt Supabases Standard-Auth-Mails
// (Absender "Supabase Auth", kein Branding, kein Custom-Template).
import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM_EMAIL || 'Turnkiste <onboarding@resend.dev>';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY fehlt in der Umgebung.');
  return new Resend(key);
}

function layout(bodyHtml: string) {
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
                <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.02em;">TURNKISTE</span>
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
                  Longevity Lifestyle Challenge · Diese Mail wurde automatisch versendet.
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

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

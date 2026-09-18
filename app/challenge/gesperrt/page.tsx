// Sperrscreen für Endkunden, deren Zugang vom Studio oder vom Platform-Admin
// gesperrt wurde (Studio-weit oder individuell) — siehe app/api/admin/studios/[studioId]
// (Studio sperren) bzw. app/api/admin/teilnahme/[teilnahmeId]/sperren (einzeln).
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';

export const metadata = { title: 'Zugang gesperrt' };

export default function GesperrtPage() {
  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader loggedIn />
      <main className="mx-auto max-w-xl px-5 py-20 text-center sm:py-28">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-3xl">
          🔒
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
          Dein Zugang ist gesperrt.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-text-muted">
          Dein Zugang zur Challenge wurde vorübergehend gesperrt. Bitte wende dich an dein Studio,
          um das zu klären.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

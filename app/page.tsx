// Supplemently — simple Startseite (unstyled, Stage 3).
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Supplemently</h1>
      <p>Finde heraus, welche Nahrungsergänzungsmittel zu deinem Lifestyle passen.</p>
      <p>
        <Link href="/fragebogen">Zum Fragebogen →</Link>
      </p>
    </main>
  );
}

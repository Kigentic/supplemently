// Supplemently — Root-Layout (minimal, kein Styling — Stage 4).
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Supplemently',
  description: 'Supplement-Empfehlungen basierend auf deinem Lifestyle.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}

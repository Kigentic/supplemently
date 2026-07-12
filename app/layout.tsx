// Supplemently — Root-Layout: Inter (nur Sans) + globales Design-System.
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Supplemently — Ehrliche Supplement-Empfehlungen für dein Studio',
  description:
    'Der Whitelabel-Nährstoff-Ratgeber für Fitnessstudios: individuelle, evidenzbasierte Empfehlungen für deine Mitglieder — nur was wirklich nötig ist, in Formen mit guter Bioverfügbarkeit.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}

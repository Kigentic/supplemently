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
    'Das Whitelabel-Tool für Fitnessstudios: individuelle, evidenzbasierte Supplement-Empfehlungen für deine Mitglieder. Kein Verkaufsdruck, keine Pauschalpakete.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}

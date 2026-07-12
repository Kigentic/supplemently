// Supplemently — Root-Layout: Fonts + globales Design-System.
import type { ReactNode } from 'react';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
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
    <html lang="de" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}

// Root-Layout: Inter (nur Sans) + globales Design-System.
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
  title: 'MoveIn8 — Das Studio Challenge System',
  description:
    'Schlüsselfertige 8-Wochen-Challenges für dein Fitnessstudio: Onboarding, KI-Coach, Check-ins und Supplement-Upsell inklusive.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}

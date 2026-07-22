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
  title: 'Longevity Lifestyle Challenge — 8 Wochen zu deinem besseren Ich',
  description:
    'Die Longevity Lifestyle Challenge: Training, Ernährung und Supplements individuell auf dich abgestimmt. 8 Wochen, echte Community, messbare Ergebnisse.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}

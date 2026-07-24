// "So geht's"-Link + Popup für Habits mit konkreter Ausführungsanleitung
// (Mobility, Stretching, Atemübungen). Rotiert bei mehreren Varianten
// nach der aktuell betrachteten Woche, siehe pickAnleitungsVariante().
'use client';

import { useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { pickAnleitungsVariante, type AnleitungsVariante } from '@/lib/challengeWeeks';

export default function AnleitungLink({
  varianten,
  contextWeek,
}: {
  varianten: AnleitungsVariante[];
  contextWeek: number;
}) {
  const [open, setOpen] = useState(false);
  const variante = pickAnleitungsVariante(varianten, contextWeek);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-accent hover:underline"
      >
        So geht&apos;s →
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-surface p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-text">{variante.titel}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Schließen"
                className="shrink-0 rounded-full p-1 text-text-muted hover:text-text"
              >
                <IconX size={20} stroke={1.75} />
              </button>
            </div>

            <ol className="mt-5 space-y-4">
              {variante.uebungen.map((u) => (
                <li key={u.name} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-text">{u.name}</p>
                    {u.hinweis && (
                      <p className="mt-0.5 text-sm leading-relaxed text-text-muted">{u.hinweis}</p>
                    )}
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-accent">
                    {u.dauer}
                  </span>
                </li>
              ))}
            </ol>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-hover"
            >
              Verstanden
            </button>
          </div>
        </div>
      )}
    </>
  );
}

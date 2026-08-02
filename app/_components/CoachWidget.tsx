'use client';

// KI-Coach: schwebender Chat-Button + Panel, auf Challenge-Seiten eingebunden.
// Holt Antworten aus /api/coach/chat (RAG über Challenge-Wissen + globale
// Supplement-Wissensdatenbank, siehe lib/kb.ts).
import { useEffect, useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabaseBrowser';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function CoachWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    setInput('');

    const nextMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const supabase = getBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setError('Bitte neu einloggen.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text, history: nextMessages.slice(0, -1).slice(-6) }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error ?? 'Der Coach antwortet gerade nicht. Versuch es nochmal.');
        setLoading(false);
        return;
      }
      setMessages((cur) => [...cur, { role: 'assistant', content: json.reply as string }]);
    } catch {
      setError('Netzwerkfehler. Bitte erneut versuchen.');
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[min(32rem,70vh)] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-outline/60 bg-bg shadow-xl">
          <div className="flex items-center justify-between border-b border-outline/50 bg-surface px-4 py-3">
            <p className="text-sm font-semibold text-text">KI-Coach</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Schließen"
              className="text-text-muted transition hover:text-text"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <p className="text-sm text-text-muted">
                Frag mich zu deinen Aufgaben, Workouts, Mobility oder Supplements — ich kenn deine
                Challenge und die Supplement-Wissensdatenbank.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.role === 'user' ? 'bg-accent text-on-accent' : 'bg-surface text-text'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-surface px-3.5 py-2.5 text-sm text-text-muted">…</div>
              </div>
            )}
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

          <div className="flex items-end gap-2 border-t border-outline/50 p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Frag den Coach …"
              className="max-h-24 flex-1 resize-none rounded-lg border border-outline bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={send}
              disabled={loading || !input.trim()}
              className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              Senden
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="KI-Coach öffnen"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl text-on-accent shadow-lg transition hover:bg-accent-hover"
      >
        {open ? '✕' : '💬'}
      </button>
    </>
  );
}

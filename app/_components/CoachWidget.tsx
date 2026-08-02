'use client';

// KI-Coach "Charles": schwebender Chat-Button + Panel im Intercom-Stil, auf
// Challenge-Seiten eingebunden. Holt Antworten aus /api/coach/chat (RAG über
// Challenge-Wissen + globale Supplement-Wissensdatenbank, siehe lib/kb.ts).
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
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
  }, [messages, open, loading]);

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
        setError(json?.error ?? 'Charles antwortet gerade nicht. Versuch es nochmal.');
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
        <div className="fixed bottom-24 right-5 z-40 flex h-[min(34rem,72vh)] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[1.75rem] border border-black/5 bg-bg shadow-2xl ring-1 ring-black/5">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-br from-accent to-accent-hover px-5 py-4">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white/20 ring-2 ring-white/40">
              <Image src="/Trainer_Icon.png" alt="Charles" fill sizes="44px" className="object-cover object-top" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-on-accent">Charles</p>
              <p className="truncate text-xs text-on-accent/80">Dein persönlicher KI-Challenge Coach</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Schließen"
              className="shrink-0 rounded-full p-1.5 text-on-accent/80 transition hover:bg-white/15 hover:text-on-accent"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-surface/40 px-4 py-4">
            {messages.length === 0 && (
              <div className="flex items-start gap-2.5">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-black/5">
                  <Image src="/Trainer_Icon.png" alt="Charles" fill sizes="32px" className="object-cover object-top" />
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-bg px-3.5 py-2.5 text-sm text-text shadow-sm">
                  Hey, ich bin Charles 👋 Frag mich zu deinen Aufgaben, Workouts, Mobility oder
                  Supplements — ich kenn deine Challenge und die Supplement-Wissensdatenbank.
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex items-start gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-black/5">
                    <Image src="/Trainer_Icon.png" alt="Charles" fill sizes="32px" className="object-cover object-top" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] whitespace-pre-wrap px-3.5 py-2.5 text-sm shadow-sm ${
                    m.role === 'user'
                      ? 'rounded-2xl rounded-tr-sm bg-accent text-on-accent'
                      : 'rounded-2xl rounded-tl-sm bg-bg text-text'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-black/5">
                  <Image src="/Trainer_Icon.png" alt="Charles" fill sizes="32px" className="object-cover object-top" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-bg px-4 py-3 shadow-sm">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" />
                </div>
              </div>
            )}
            {error && <p className="pl-10 text-xs text-red-600">{error}</p>}
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 border-t border-outline/40 bg-bg p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Frag Charles …"
              className="max-h-24 flex-1 resize-none rounded-full border border-outline bg-surface px-4 py-2.5 text-sm text-text outline-none transition focus:border-accent"
            />
            <button
              type="button"
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Senden"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 20L20.5 12L4 4L4 10L15 12L4 14L4 20Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Charles schließen' : 'Charles öffnen'}
        className="fixed bottom-5 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover shadow-xl ring-4 ring-bg transition hover:scale-105"
      >
        {open ? (
          <span className="text-2xl text-on-accent">✕</span>
        ) : (
          <span className="relative block h-full w-full overflow-hidden rounded-full">
            <Image src="/Trainer_Icon.png" alt="Charles, dein KI-Coach" fill sizes="64px" className="object-cover object-top" />
          </span>
        )}
      </button>
    </>
  );
}

-- KI-Coach Wissensdatenbank: PDF-Inhalte + Challenge-Wissen als durchsuchbare
-- Chunks mit Embeddings (pgvector). challenge_typ_id = null -> global
-- (z.B. Supplement-Wissen), sonst nur für den jeweiligen Challenge-Typ.

create extension if not exists vector;

create table if not exists public.kb_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type text not null, -- 'pdf' | 'challenge_content'
  challenge_typ_id uuid references public.challenge_typen(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.kb_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.kb_documents(id) on delete cascade,
  challenge_typ_id uuid references public.challenge_typen(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  embedding vector(1536) not null,
  created_at timestamptz not null default now()
);

create index if not exists kb_chunks_embedding_idx
  on public.kb_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create index if not exists kb_chunks_challenge_typ_idx on public.kb_chunks (challenge_typ_id);

-- Deny-all außer service_role (gleiches Muster wie challenges-Tabelle).
alter table public.kb_documents enable row level security;
alter table public.kb_chunks enable row level security;

create or replace function public.match_kb_chunks(
  query_embedding vector(1536),
  match_count int,
  p_challenge_typ_id uuid
) returns table (id uuid, content text, similarity float)
language sql stable
as $$
  select kb_chunks.id, kb_chunks.content, 1 - (kb_chunks.embedding <=> query_embedding) as similarity
  from public.kb_chunks
  where kb_chunks.challenge_typ_id is null or kb_chunks.challenge_typ_id = p_challenge_typ_id
  order by kb_chunks.embedding <=> query_embedding
  limit match_count;
$$;

-- Presales-Charles (Landingpage, kein Login) soll die Challenge erklären
-- können, aber nicht auf die Supplement-PDFs/E-Books zurückgreifen — der
-- Member-Coach (nach Login) weiterhin schon. match_kb_chunks bekommt dafür
-- einen optionalen Filter auf kb_documents.source_type ('pdf' ausschließen).

create or replace function public.match_kb_chunks(
  query_embedding vector(1536),
  match_count int,
  p_challenge_typ_id uuid,
  p_exclude_source_types text[] default null
) returns table (id uuid, content text, similarity float)
language sql stable
as $$
  select kb_chunks.id, kb_chunks.content, 1 - (kb_chunks.embedding <=> query_embedding) as similarity
  from public.kb_chunks
  join public.kb_documents on public.kb_documents.id = kb_chunks.document_id
  where (kb_chunks.challenge_typ_id is null or kb_chunks.challenge_typ_id = p_challenge_typ_id)
    and (p_exclude_source_types is null or public.kb_documents.source_type <> all (p_exclude_source_types))
  order by kb_chunks.embedding <=> query_embedding
  limit match_count;
$$;

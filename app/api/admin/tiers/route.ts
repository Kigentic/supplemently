import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';

export const runtime = 'nodejs';

export async function GET() {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('supplements')
    .select('id, name, kategorie, tier')
    .order('kategorie')
    .order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  // body: Array<{ id: string; tier: 'basis' | 'advanced' | 'addon' }>
  if (!Array.isArray(body)) return NextResponse.json({ error: 'Array erwartet.' }, { status: 400 });

  const supabase = getServiceClient();
  const results = await Promise.all(
    body.map(({ id, tier }: { id: string; tier: string }) =>
      supabase.from('supplements').update({ tier }).eq('id', id)
    )
  );

  const failed = results.filter((r) => r.error);
  if (failed.length) return NextResponse.json({ error: 'Teilweise fehlgeschlagen.', count: failed.length }, { status: 500 });
  return NextResponse.json({ ok: true, updated: body.length });
}

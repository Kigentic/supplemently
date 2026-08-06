// API: Masteradmin löscht einen User komplett (Auth-User + Profil + alle
// Challenge-Teilnahmen/Check-ins/Empfehlungen via ON DELETE CASCADE) — v.a.
// zum Zurücksetzen von Test-Registrierungen gedacht.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader, getAdminScope } from '@/lib/apiAuth';

export const runtime = 'nodejs';

export async function DELETE(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const supabase = getServiceClient();
  const scope = await getAdminScope(supabase, user.id);
  if (!scope.isMasterAdmin) {
    return NextResponse.json({ error: 'Nur der Masteradmin darf User löschen.' }, { status: 403 });
  }

  const { userId } = await params;

  if (userId === user.id) {
    return NextResponse.json({ error: 'Du kannst dich nicht selbst löschen.' }, { status: 400 });
  }

  const { data: target } = await supabase
    .from('profiles')
    .select('ist_admin')
    .eq('id', userId)
    .maybeSingle();

  if (target?.ist_admin) {
    return NextResponse.json({ error: 'Admin-Accounts können hier nicht gelöscht werden.' }, { status: 400 });
  }

  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    console.error('User delete error:', error);
    return NextResponse.json({ error: 'Löschen fehlgeschlagen.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

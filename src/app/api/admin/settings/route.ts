import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/session';
import { adminUpdateSettingsSchema } from '@/lib/validation';

export async function GET() {
  const settings = await db.getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
  }
  const actor = await db.findUserById(session.sub);
  if (!actor || actor.role !== 'admin') {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = adminUpdateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Ошибка валидации настроек' },
      { status: 400 },
    );
  }

  const settings = await db.updateSiteSettings(parsed.data);
  return NextResponse.json({ settings });
}

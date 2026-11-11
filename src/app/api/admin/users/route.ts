import { NextRequest, NextResponse } from 'next/server';
import { db, toPublicUser } from '@/lib/db';
import { getServerSession } from '@/lib/session';
import { adminUpdateUserSchema } from '@/lib/validation';

async function requireAdmin() {
  const session = await getServerSession();
  if (!session) {
    return { error: NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 }) };
  }
  const actor = await db.findUserById(session.sub);
  if (!actor || actor.role !== 'admin') {
    return {
      error: NextResponse.json(
        { error: 'Доступ запрещён: требуются права администратора' },
        { status: 403 },
      ),
    };
  }
  return { actor };
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const users = await db.listUsers();
  return NextResponse.json({ users: users.map(toPublicUser) });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = adminUpdateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Неверные параметры' },
      { status: 400 },
    );
  }

  const { userId, action, subscriptionTier, days, role } = parsed.data;
  const target = await db.findUserById(userId);
  if (!target) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  }

  if (action === 'set_subscription') {
    const tier = subscriptionTier || 'month';
    let expiresAt: string | null = null;
    if (tier === 'month') {
      expiresAt = new Date(Date.now() + (days ?? 30) * 86400_000).toISOString();
    } else if (tier === 'quarter') {
      expiresAt = new Date(Date.now() + (days ?? 90) * 86400_000).toISOString();
    } else if (tier === 'lifetime' || tier === 'free') {
      expiresAt = null;
    }
    const updated = await db.updateUserSubscription(userId, tier, expiresAt);
    return NextResponse.json({ user: updated ? toPublicUser(updated) : null });
  }

  if (action === 'revoke_subscription') {
    const updated = await db.updateUserSubscription(userId, 'free', null);
    return NextResponse.json({ user: updated ? toPublicUser(updated) : null });
  }

  if (action === 'set_role') {
    const nextRole = role || 'user';
    // Защита главного администратора MrDarko от случайного снятия прав самого себя
    if (target.username.toLowerCase() === 'mrdarko' && nextRole !== 'admin') {
      return NextResponse.json(
        { error: 'Нельзя снять роль admin у главного администратора MrDarko' },
        { status: 400 },
      );
    }
    const updated = await db.updateUserRole(userId, nextRole);
    return NextResponse.json({ user: updated ? toPublicUser(updated) : null });
  }

  if (action === 'reset_hwid') {
    const updated = await db.resetUserHwid(userId, null);
    return NextResponse.json({ user: updated ? toPublicUser(updated) : null });
  }

  return NextResponse.json({ error: 'Неизвестное действие' }, { status: 400 });
}

import { NextRequest, NextResponse } from 'next/server';
import { db, toPublicUser } from '@/lib/db';
import { generateHwid, hashPassword } from '@/lib/password';
import {
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
  signSessionToken,
} from '@/lib/session';
import { registerSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Некорректные данные регистрации' },
        { status: 400 },
      );
    }

    const { username, email, password, inviteCode } = parsed.data;

    const existingEmail = await db.findUserByEmailOrUsername(email);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Аккаунт с таким email уже зарегистрирован' },
        { status: 409 },
      );
    }

    const existingUsername = await db.findUserByEmailOrUsername(username);
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Этот никнейм уже занят' },
        { status: 409 },
      );
    }

    // Скрытая регистрация администратора через инвайт-код, заданный в ENV (или ручное назначение в БД)
    const configuredInvite = process.env.ADMIN_INVITE_CODE ?? 'WIRE-ADMIN-2026';
    const isAdminInvite = Boolean(
      configuredInvite && inviteCode && inviteCode === configuredInvite,
    );

    const passwordHash = await hashPassword(password);
    const user = await db.createUser({
      username,
      email,
      passwordHash,
      role: isAdminInvite ? 'admin' : 'user',
      subscriptionTier: isAdminInvite ? 'lifetime' : 'free',
      subscriptionExpiresAt: null,
      hwid: generateHwid(),
    });

    const token = await signSessionToken({
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const isHttps =
      request.headers.get('x-forwarded-proto') === 'https' ||
      request.url.startsWith('https://');

    const response = NextResponse.json(
      {
        user: toPublicUser(user),
        redirectTo: user.role === 'admin' ? '/admin' : '/dashboard',
      },
      { status: 201 },
    );

    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions(isHttps));
    return response;
  } catch (err) {
    console.error('[POST /api/auth/register]', err);
    return NextResponse.json({ error: 'Ошибка регистрации' }, { status: 500 });
  }
}

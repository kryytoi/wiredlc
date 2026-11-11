import { NextRequest, NextResponse } from 'next/server';
import { db, toPublicUser } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import {
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
  signSessionToken,
} from '@/lib/session';
import { loginSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Некорректные данные формы' },
        { status: 400 },
      );
    }

    const { identifier, password } = parsed.data;
    const user = await db.findUserByEmailOrUsername(identifier);

    if (!user) {
      return NextResponse.json(
        { error: 'Неверный email/никнейм или пароль' },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Неверный email/никнейм или пароль' },
        { status: 401 },
      );
    }

    const token = await signSessionToken({
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const isHttps =
      request.headers.get('x-forwarded-proto') === 'https' ||
      request.url.startsWith('https://');

    const response = NextResponse.json({
      user: toPublicUser(user),
      redirectTo: user.role === 'admin' ? '/admin' : '/dashboard',
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions(isHttps));
    return response;
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

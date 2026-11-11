import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // API защита: возвращаем JSON-ошибку, а не HTML-редирект
  if (pathname.startsWith('/api/admin')) {
    if (!session) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
    }
    if (session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ разрешён только администратору (MrDarko / role=admin)' },
        { status: 403 },
      );
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/user')) {
    if (!session) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Защита страниц личного кабинета
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Защита админ-панели
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', '/admin');
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== 'admin') {
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.searchParams.set('error', 'admin_only');
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // Если пользователь уже вошёл — не держим его на /login и /register
  if (pathname === '/login' || pathname === '/register') {
    if (session) {
      const target = session.role === 'admin' ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/api/user/:path*',
    '/api/admin/:path*',
  ],
};

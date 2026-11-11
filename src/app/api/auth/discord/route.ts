import { NextRequest, NextResponse } from 'next/server';

/**
 * Задел под Discord OAuth2.
 * При наличии DISCORD_CLIENT_ID и DISCORD_REDIRECT_URI перенаправляет на oauth2/authorize.
 * В MVP без ключей возвращает понятный JSON/редирект, не ломая UX.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (clientId && redirectUri) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify email',
    });
    return NextResponse.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
  }

  // Если вызов сделан как переход по ссылке из браузера без OAuth-ключей — возвращаем на /login с подсказкой
  const wantsJson = request.headers.get('accept')?.includes('application/json');
  if (wantsJson) {
    return NextResponse.json(
      {
        configured: false,
        message:
          'Discord OAuth2 ещё не настроен: добавьте DISCORD_CLIENT_ID и DISCORD_CLIENT_SECRET в .env (см. README).',
      },
      { status: 501 },
    );
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('discord', 'unconfigured');
  return NextResponse.redirect(loginUrl);
}

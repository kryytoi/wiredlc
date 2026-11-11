import { NextRequest, NextResponse } from 'next/server';
import { db, toPublicUser } from '@/lib/db';
import { generateHwid } from '@/lib/password';
import { HWID_RESET_PRODUCT } from '@/lib/pricing';
import { getServerSession } from '@/lib/session';
import type { PaymentMethod } from '@/lib/types';

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
  }

  const user = await db.findUserById(session.sub);
  if (!user) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    mode?: 'order' | 'demo_reset';
    paymentMethod?: PaymentMethod;
    note?: string;
  };

  // Режим демо-сброса HWID для тестирования интерфейса личного кабинета в MVP
  if (body.mode === 'demo_reset') {
    const nextHwid = generateHwid();
    const updated = await db.resetUserHwid(user.id, nextHwid);
    return NextResponse.json({
      ok: true,
      mode: 'demo_reset',
      message: 'HWID перевыпущен в демо-режиме (в продакшене привязывается к железу при запуске лоадера).',
      user: updated ? toPublicUser(updated) : null,
    });
  }

  // Штатный режим: создание платной заявки на сброс HWID (170 ₽)
  const paymentMethod: PaymentMethod = body.paymentMethod || 'sbp';
  const order = await db.createOrder({
    userId: user.id,
    itemCode: 'hwid_reset',
    itemTitle: HWID_RESET_PRODUCT.title,
    amount: HWID_RESET_PRODUCT.price,
    currency: HWID_RESET_PRODUCT.currency,
    paymentMethod,
    status: 'pending',
    note: body.note || 'Заявка на сброс HWID из личного кабинета',
  });

  return NextResponse.json({
    ok: true,
    mode: 'order',
    message: 'Заявка на сброс HWID (170 ₽) создана. После подтверждения оплаты привязка будет сброшена.',
    order,
  });
}

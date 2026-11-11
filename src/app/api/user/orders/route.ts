import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { HWID_RESET_PRODUCT, PRICING_PLANS } from '@/lib/pricing';
import { getServerSession } from '@/lib/session';
import { createOrderSchema } from '@/lib/validation';

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
  }

  const orders = await db.listOrdersByUser(session.sub);
  return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Войдите в аккаунт для оформления заказа' }, { status: 401 });
  }

  const user = await db.findUserById(session.sub);
  if (!user) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Неверные данные заказа' },
      { status: 400 },
    );
  }

  const { itemCode, paymentMethod, note } = parsed.data;

  // Серверный расчёт цены — клиент не может подменить сумму или валюту
  if (itemCode === 'hwid_reset') {
    const order = await db.createOrder({
      userId: user.id,
      itemCode: 'hwid_reset',
      itemTitle: HWID_RESET_PRODUCT.title,
      amount: HWID_RESET_PRODUCT.price,
      currency: HWID_RESET_PRODUCT.currency,
      paymentMethod,
      status: 'pending',
      note: note || null,
    });
    return NextResponse.json({ order }, { status: 201 });
  }

  const plan = PRICING_PLANS.find((p) => p.id === itemCode);
  if (!plan) {
    return NextResponse.json({ error: 'Тариф не найден' }, { status: 400 });
  }

  const order = await db.createOrder({
    userId: user.id,
    itemCode: plan.id,
    itemTitle: `Подписка ${plan.title} (${plan.subtitle})`,
    amount: plan.price,
    currency: plan.currency,
    paymentMethod,
    status: 'pending',
    note: note || null,
  });

  return NextResponse.json({ order }, { status: 201 });
}

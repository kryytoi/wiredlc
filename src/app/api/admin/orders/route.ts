import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/session';
import { adminUpdateOrderSchema } from '@/lib/validation';

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

  const orders = await db.listAllOrders();
  return NextResponse.json({ orders });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = adminUpdateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Неверные параметры заказа' },
      { status: 400 },
    );
  }

  const { orderId, status } = parsed.data;
  const updatedOrder = await db.updateOrderStatus(orderId, status);
  if (!updatedOrder) {
    return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
  }

  // При подтверждении оплаты автоматически применяем услугу к аккаунту
  if (status === 'paid') {
    if (updatedOrder.itemCode === 'hwid_reset') {
      await db.resetUserHwid(updatedOrder.userId, null);
    } else if (updatedOrder.itemCode === 'month') {
      const expiresAt = new Date(Date.now() + 30 * 86400_000).toISOString();
      await db.updateUserSubscription(updatedOrder.userId, 'month', expiresAt);
    } else if (updatedOrder.itemCode === 'quarter') {
      const expiresAt = new Date(Date.now() + 90 * 86400_000).toISOString();
      await db.updateUserSubscription(updatedOrder.userId, 'quarter', expiresAt);
    } else if (updatedOrder.itemCode === 'lifetime') {
      await db.updateUserSubscription(updatedOrder.userId, 'lifetime', null);
    }
  }

  return NextResponse.json({ order: updatedOrder });
}

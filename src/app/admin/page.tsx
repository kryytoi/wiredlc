import { redirect } from 'next/navigation';
import { db, toPublicUser } from '@/lib/db';
import { getServerSession } from '@/lib/session';
import { AdminClient } from '@/components/AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession();
  if (!session) {
    redirect('/login?redirect=/admin');
  }

  const actor = await db.findUserById(session.sub);
  if (!actor) {
    redirect('/login');
  }

  // Строгая серверная проверка прав администратора (MrDarko / role=admin)
  if (actor.role !== 'admin') {
    redirect('/dashboard?error=admin_only');
  }

  const [users, orders, settings] = await Promise.all([
    db.listUsers(),
    db.listAllOrders(),
    db.getSiteSettings(),
  ]);

  return (
    <AdminClient
      currentUser={toPublicUser(actor)}
      initialUsers={users.map(toPublicUser)}
      initialOrders={orders}
      initialSettings={settings}
    />
  );
}

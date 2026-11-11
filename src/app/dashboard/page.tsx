import { redirect } from 'next/navigation';
import { db, toPublicUser } from '@/lib/db';
import { getServerSession } from '@/lib/session';
import { DashboardClient } from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect('/login?redirect=/dashboard');
  }

  const user = await db.findUserById(session.sub);
  if (!user) {
    redirect('/login');
  }

  const [{ error }, orders, settings] = await Promise.all([
    searchParams,
    db.listOrdersByUser(user.id),
    db.getSiteSettings(),
  ]);

  return (
    <DashboardClient
      initialUser={toPublicUser(user)}
      initialOrders={orders}
      settings={settings}
      adminOnlyError={error === 'admin_only'}
    />
  );
}

import { db, toPublicUser } from '@/lib/db';
import { getServerSession } from '@/lib/session';
import { LandingClient } from '@/components/LandingClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [session, settings] = await Promise.all([
    getServerSession(),
    db.getSiteSettings(),
  ]);

  let userRecord = null;
  if (session) {
    try {
      userRecord = await db.findUserById(session.sub);
    } catch {
      userRecord = null;
    }
  }
  const user = userRecord ? toPublicUser(userRecord) : null;

  return <LandingClient user={user} settings={settings} />;
}

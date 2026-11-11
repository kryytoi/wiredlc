import { NextResponse } from 'next/server';
import { db, toPublicUser } from '@/lib/db';
import { getServerSession } from '@/lib/session';

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await db.findUserById(session.sub);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: toPublicUser(user) });
}

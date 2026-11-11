import { NextResponse } from 'next/server';
import { db, getActiveDbProvider } from '@/lib/db';

export async function GET() {
  const settings = await db.getSiteSettings();
  return NextResponse.json({
    ok: true,
    service: 'wiredlc',
    dbProvider: getActiveDbProvider(),
    minecraftVersion: settings.minecraftVersion,
    loader: settings.loaderName,
    timestamp: new Date().toISOString(),
  });
}

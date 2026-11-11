import { Suspense } from 'react';
import { db } from '@/lib/db';
import { AuthForm } from '@/components/AuthForm';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  const settings = await db.getSiteSettings();
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050507]" />}>
      <AuthForm mode="register" logoUrl={settings.logoUrl} />
    </Suspense>
  );
}

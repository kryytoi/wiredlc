import { db, toPublicUser } from '@/lib/db';
import { getServerSession } from '@/lib/session';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PricingSection } from '@/components/PricingSection';
import type { OrderItemCode } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const [{ plan }, session, settings] = await Promise.all([
    searchParams,
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

  const validPlans: OrderItemCode[] = ['month', 'quarter', 'lifetime', 'hwid_reset'];
  const initialItem =
    plan && validPlans.includes(plan as OrderItemCode) ? (plan as OrderItemCode) : null;

  return (
    <div className="min-h-screen bg-[#050507] text-[#F4F4F8]">
      <Navbar user={user} logoUrl={settings.logoUrl} />

      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-12 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-violet-400">
            Тарифы и оплата · {settings.minecraftVersion} {settings.loaderName}
          </span>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Доступ к Wire DLC
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#9CA3AF]">
            Выберите подходящий период лицензии или закажите разовый сброс HWID. Оплата через СБП, карты РФ, криптовалюту или поддержку для UA-карт.
          </p>
        </div>

        <PricingSection
          user={user}
          minecraftVersion={settings.minecraftVersion}
          loaderName={settings.loaderName}
          mandarinNote={settings.mandarinNote}
          supportTelegram={settings.supportTelegram}
          initialItem={initialItem}
        />
      </main>

      <Footer settings={settings} />
    </div>
  );
}

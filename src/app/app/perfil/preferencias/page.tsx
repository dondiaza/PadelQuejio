import { NotificationPreferencesForm } from "@/components/app/notification-preferences-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const defaults = {
  email: true,
  sms: false,
  push: false,
  reminder24h: true,
  reminder2h: true,
};

export default async function PreferencesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const key = `user_notification_preferences:${session.user.id}`;
  const row = await prisma.setting.findUnique({ where: { key } });
  const raw = (row?.value ?? defaults) as Partial<typeof defaults>;

  const initial = {
    email: Boolean(raw.email ?? defaults.email),
    sms: Boolean(raw.sms ?? defaults.sms),
    push: Boolean(raw.push ?? defaults.push),
    reminder24h: Boolean(raw.reminder24h ?? defaults.reminder24h),
    reminder2h: Boolean(raw.reminder2h ?? defaults.reminder2h),
  };

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <h1 className="section-title">PREFERENCIAS</h1>
        <p className="mt-2 text-sm text-muted">
          Configura tus canales de aviso y recordatorios de reserva.
        </p>
      </section>
      <section className="card p-5">
        <NotificationPreferencesForm initial={initial} />
      </section>
    </div>
  );
}

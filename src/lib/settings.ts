import { prisma } from "@/lib/prisma";

export const DEFAULT_SETTINGS = {
  booking_days_ahead_default: 14,
  pending_payment_expiry_minutes: 10,
  cancellation_window_hours: 12,
  late_cancellation_policy: "no_refund",
  currency: "EUR",
  tax_rate: 0,
  require_subscription_to_book: false,
  notifications_enabled: {
    email: true,
    sms: false,
    push: false,
  },
  base_price_per_slot: 20,
} as const;

type SettingValue = number | string | boolean | Record<string, unknown> | unknown[];

export async function getSetting<T extends SettingValue>(
  key: keyof typeof DEFAULT_SETTINGS,
): Promise<T> {
  const setting = await prisma.setting.findUnique({
    where: { key },
  });

  if (!setting) {
    return DEFAULT_SETTINGS[key] as T;
  }

  return setting.value as T;
}

export async function getSettings() {
  const rows = await prisma.setting.findMany();
  const dynamic = rows.reduce<Record<string, unknown>>((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  return {
    ...DEFAULT_SETTINGS,
    ...dynamic,
  };
}

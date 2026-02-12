import { processScheduledNotifications } from "@/lib/notifications/dispatcher";
import { expirePendingReservations } from "@/lib/reservations";
import { expireOutdatedSubscriptions } from "@/lib/subscriptions";

const intervalMs = 60_000;

async function tick() {
  const [expiredReservations, expiredSubscriptions, processedNotifications] =
    await Promise.all([
      expirePendingReservations(),
      expireOutdatedSubscriptions(),
      processScheduledNotifications(),
    ]);

  console.log(
    `[worker] expiredReservations=${expiredReservations} expiredSubscriptions=${expiredSubscriptions} processedNotifications=${processedNotifications}`,
  );
}

async function start() {
  await tick();
  setInterval(() => {
    tick().catch((error: unknown) => {
      console.error("[worker] tick failed", error);
    });
  }, intervalMs);
}

start().catch((error: unknown) => {
  console.error("[worker] failed to start", error);
  process.exit(1);
});

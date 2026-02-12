import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";

const defaults = {
  email: true,
  sms: false,
  push: false,
  reminder24h: true,
  reminder2h: true,
};

const updatePreferencesSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  push: z.boolean(),
  reminder24h: z.boolean(),
  reminder2h: z.boolean(),
});

function keyForUser(userId: string) {
  return `user_notification_preferences:${userId}`;
}

export async function GET() {
  const guard = await requireUser();
  if ("error" in guard) {
    return guard.error;
  }

  const key = keyForUser(guard.session.user.id);
  const row = await prisma.setting.findUnique({ where: { key } });
  const data = row?.value ?? (defaults as unknown as Prisma.JsonObject);

  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
  const guard = await requireUser();
  if ("error" in guard) {
    return guard.error;
  }

  const body = await request.json();
  const parsed = updatePreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const row = await prisma.setting.upsert({
    where: { key: keyForUser(guard.session.user.id) },
    update: {
      value: parsed.data as unknown as Prisma.JsonObject,
      updatedBy: guard.session.user.id,
    },
    create: {
      key: keyForUser(guard.session.user.id),
      value: parsed.data as unknown as Prisma.JsonObject,
      updatedBy: guard.session.user.id,
    },
  });

  return NextResponse.json({ data: row.value });
}

import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const passwordHash = await hash(parsed.data.password, 12);
    const userRole = await prisma.role.upsert({
      where: { name: "user" },
      update: {},
      create: { name: "user" },
    });

    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name,
        phone: parsed.data.phone,
        passwordHash,
        status: "active",
        userRoles: {
          create: {
            roleId: userRole.id,
          },
        },
      },
    });

    return NextResponse.json(
      {
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register route failed:", error);
    return NextResponse.json(
      { error: "Registration service temporarily unavailable" },
      { status: 503 },
    );
  }
}

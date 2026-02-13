import "dotenv/config";

import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "admin";
  const name = process.env.ADMIN_NAME ?? "admin";

  const passwordHash = await hash(password, 12);

  const [roleUser, roleAdmin] = await Promise.all([
    prisma.role.upsert({
      where: { name: "user" },
      update: {},
      create: { name: "user" },
    }),
    prisma.role.upsert({
      where: { name: "admin" },
      update: {},
      create: { name: "admin" },
    }),
  ]);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      status: "active",
      passwordHash,
    },
    create: {
      email,
      name,
      status: "active",
      passwordHash,
    },
  });

  await prisma.userRole.createMany({
    data: [
      { userId: user.id, roleId: roleUser.id },
      { userId: user.id, roleId: roleAdmin.id },
    ],
    skipDuplicates: true,
  });

  console.log("Admin user ready:");
  console.log(`email=${email}`);
  console.log(`password=${password}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

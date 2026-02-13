import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client/index";

declare global {
  var __prisma__: PrismaClient | undefined;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  try {
    return new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } catch (error) {
    console.error("Failed to initialize Prisma client:", error);
    return null;
  }
}

const prismaClient = global.__prisma__ ?? createPrismaClient();

if (process.env.NODE_ENV !== "production" && prismaClient) {
  global.__prisma__ = prismaClient;
}

const prismaUnavailableMessage =
  "Prisma client is unavailable. Verify DATABASE_URL and database connectivity.";

const prismaUnavailableProxy = new Proxy(
  {},
  {
    get() {
      throw new Error(prismaUnavailableMessage);
    },
  },
) as PrismaClient;

export const prisma = prismaClient ?? prismaUnavailableProxy;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

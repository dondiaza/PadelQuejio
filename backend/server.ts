import "dotenv/config";

import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

const port = Number(process.env.BACKEND_PORT ?? 4000);
const host = process.env.BACKEND_HOST ?? "0.0.0.0";
const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to start backend service");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: JsonValue,
) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type,x-admin-bootstrap-secret");
  response.end(JSON.stringify(payload));
}

function readJsonBody(request: IncomingMessage) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += String(chunk);
    });

    request.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }

      try {
        const parsed = JSON.parse(body) as Record<string, unknown>;
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
  });
}

async function ensureRole(roleName: "user" | "admin") {
  return prisma.role.upsert({
    where: { name: roleName },
    update: {},
    create: { name: roleName },
  });
}

async function ensureAdminByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("email is required");
  }

  const [userRole, adminRole] = await Promise.all([ensureRole("user"), ensureRole("admin")]);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.userRole.createMany({
    data: [
      { userId: user.id, roleId: userRole.id },
      { userId: user.id, roleId: adminRole.id },
    ],
    skipDuplicates: true,
  });

  return user;
}

const server = createServer(async (request, response) => {
  if (!request.url || !request.method) {
    sendJson(response, 400, { error: "Invalid request" });
    return;
  }

  if (request.method === "OPTIONS") {
    sendJson(response, 204, null);
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);

  try {
    if (request.method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, {
        ok: true,
        service: "padel-quejio-backend",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (request.method === "GET" && url.pathname === "/public/courts") {
      const courts = await prisma.court.findMany({
        where: { status: "active" },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
        orderBy: { name: "asc" },
      });

      sendJson(response, 200, {
        data: courts.map((court) => ({
          id: court.id,
          name: court.name,
          slug: court.slug,
          description: court.description,
          status: court.status,
          imageUrl: court.images[0]?.url ?? null,
        })),
      });
      return;
    }

    if (request.method === "GET" && url.pathname === "/public/plans") {
      const plans = await prisma.plan.findMany({
        where: { isActive: true },
        orderBy: { price: "asc" },
      });

      sendJson(response, 200, {
        data: plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price: Number(plan.price),
          billingPeriod: plan.billingPeriod,
        })),
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/admin/bootstrap") {
      if (!bootstrapSecret) {
        sendJson(response, 500, {
          error: "ADMIN_BOOTSTRAP_SECRET is not configured",
        });
        return;
      }

      const providedSecret = request.headers["x-admin-bootstrap-secret"];
      if (providedSecret !== bootstrapSecret) {
        sendJson(response, 401, { error: "Unauthorized" });
        return;
      }

      const body = await readJsonBody(request);
      const email = String(body.email ?? "").trim();
      if (!email) {
        sendJson(response, 400, { error: "email is required" });
        return;
      }

      const user = await ensureAdminByEmail(email);
      sendJson(response, 200, {
        data: {
          id: user.id,
          email: user.email,
          status: user.status,
          admin: true,
        },
      });
      return;
    }

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    console.error("Backend request failed:", error);
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Internal error",
    });
  }
});

server.listen(port, host, () => {
  console.log(`Padel Quejio backend running on http://${host}:${port}`);
});

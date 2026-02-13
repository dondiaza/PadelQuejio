import { prisma } from "@/lib/prisma";

export type PublicCourt = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "active" | "maintenance" | "inactive";
  imageUrl?: string | null;
};

export type PublicPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billingPeriod: "monthly" | "yearly";
};

const fallbackCourts: PublicCourt[] = [
  {
    id: "fallback-court-1",
    name: "Pista Quejio 1",
    slug: "pista-quejio-1",
    description: "Pista central de cristal con iluminacion LED.",
    status: "active",
    imageUrl: null,
  },
  {
    id: "fallback-court-2",
    name: "Pista Quejio 2",
    slug: "pista-quejio-2",
    description: "Pista social para partidos y entrenamiento tecnico.",
    status: "active",
    imageUrl: null,
  },
];

const fallbackPlans: PublicPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Acceso base a reservas",
    price: 29,
    billingPeriod: "monthly",
  },
  {
    id: "club",
    name: "Club",
    description: "Prioridad y descuento",
    price: 45,
    billingPeriod: "monthly",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Maximo rendimiento",
    price: 69,
    billingPeriod: "monthly",
  },
];

function getBackendApiUrl() {
  const raw = process.env.BACKEND_API_URL;
  if (!raw || !raw.trim()) {
    return null;
  }

  return raw.replace(/\/+$/, "");
}

async function fetchFromBackend<T>(path: string): Promise<T | null> {
  const baseUrl = getBackendApiUrl();
  if (!baseUrl) {
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { data?: T };
    return payload.data ?? null;
  } catch (error) {
    console.error("Backend API request failed:", error);
    return null;
  }
}

export async function getPublicCourts() {
  const backendCourts = await fetchFromBackend<PublicCourt[]>("/public/courts");
  if (backendCourts && backendCourts.length > 0) {
    return backendCourts;
  }

  try {
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

    if (courts.length === 0) {
      return fallbackCourts;
    }

    return courts.map((court) => ({
      id: court.id,
      name: court.name,
      slug: court.slug,
      description: court.description,
      status: court.status,
      imageUrl: court.images[0]?.url ?? null,
    }));
  } catch (error) {
    console.error("Failed to read courts from database:", error);
    return fallbackCourts;
  }
}

export async function getPublicPlans() {
  const backendPlans = await fetchFromBackend<PublicPlan[]>("/public/plans");
  if (backendPlans && backendPlans.length > 0) {
    return backendPlans;
  }

  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });

    if (plans.length === 0) {
      return fallbackPlans;
    }

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: Number(plan.price),
      billingPeriod: plan.billingPeriod,
    }));
  } catch (error) {
    console.error("Failed to read plans from database:", error);
    return fallbackPlans;
  }
}

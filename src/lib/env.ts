import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  AUTH_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL").optional(),
  INTERNAL_JOB_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  ADMIN_BOOTSTRAP_EMAILS: z.string().optional(),
  ADMIN_BOOTSTRAP_SECRET: z.string().optional(),
  BACKEND_API_URL: z.string().url("BACKEND_API_URL must be a valid URL").optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment variables format:\n${errors}`);
}

const placeholderMarkers = [
  "replace-with",
  "changeme",
  "example",
  "dummy",
  "test_xxx",
];

function hasRealValue(value?: string) {
  if (!value || !value.trim()) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return !placeholderMarkers.some((marker) => normalized.includes(marker));
}

export const env = {
  ...parsed.data,
  NEXT_PUBLIC_APP_URL: parsed.data.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};

export function isGoogleOAuthConfigured() {
  const hasValues =
    hasRealValue(env.GOOGLE_CLIENT_ID) && hasRealValue(env.GOOGLE_CLIENT_SECRET);
  if (!hasValues) {
    return false;
  }

  return env.GOOGLE_CLIENT_ID!.includes(".apps.googleusercontent.com");
}

export function isStripeConfigured() {
  return hasRealValue(env.STRIPE_SECRET_KEY) && hasRealValue(env.STRIPE_WEBHOOK_SECRET);
}

export function getBootstrapAdminEmails() {
  const raw = env.ADMIN_BOOTSTRAP_EMAILS;
  if (!raw) {
    return new Set<string>();
  }

  return new Set(
    raw
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function requireEnvValue(name: keyof typeof env) {
  const value = env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return String(value);
}

import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().min(7).optional(),
});

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  courtId: z.string().optional(),
});

export const createReservationSchema = z.object({
  courtId: z.string(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  requiresPayment: z.boolean().default(false),
});

export const manualActivateSubscriptionSchema = z.object({
  userId: z.string(),
  planId: z.string(),
  startedAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});

export const manualRenewSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  endsAt: z.string().datetime().optional(),
  extensionDays: z.number().int().positive().optional(),
});

export const createCourtSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  features: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(["active", "maintenance", "inactive"]).default("active"),
  baseSlotMinutes: z.number().int().positive().default(60),
});

export const adminManualReservationSchema = z.object({
  userId: z.string(),
  courtId: z.string(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  requiresPayment: z.boolean().default(false),
});

export const adminMoveReservationSchema = z.object({
  courtId: z.string(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
});

export const openingHourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  opensAt: z.string().regex(/^\d{2}:\d{2}$/),
  closesAt: z.string().regex(/^\d{2}:\d{2}$/),
});

export const specialDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isClosed: z.boolean().default(false),
  opensAt: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  closesAt: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  note: z.string().optional(),
});

export const courtBlockSchema = z.object({
  courtId: z.string(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  reason: z.string().min(3),
});

export const createGroupSchema = z.object({
  name: z.string().min(2),
});

export const addGroupMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(["owner", "member"]).default("member"),
});

export const createInviteSchema = z.object({
  invitedName: z.string().optional(),
  invitedEmail: z.string().email().optional(),
  invitedPhone: z.string().optional(),
});

export const createPlanSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  billingPeriod: z.enum(["monthly", "yearly"]),
  benefits: z.record(z.string(), z.unknown()).default({}),
  isActive: z.boolean().default(true),
});

import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";

import {
  env,
  getBootstrapAdminEmails,
  isGoogleOAuthConfigured,
} from "@/lib/env";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

const databaseEnabled = isDatabaseConfigured();

const credentialsSchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

async function getRolesForUser(userId: string) {
  if (!databaseEnabled) {
    return [];
  }

  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });

  return userRoles.map((entry) => entry.role.name);
}

async function ensureRole(userId: string, roleName: string) {
  if (!databaseEnabled) {
    return;
  }

  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    return;
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      userId,
      roleId: role.id,
    },
  });
}

async function ensureRolesByEmail(userId: string, email: string) {
  if (!databaseEnabled) {
    return;
  }

  await ensureRole(userId, "user");

  const bootstrapAdmins = getBootstrapAdminEmails();
  if (bootstrapAdmins.has(email.toLowerCase())) {
    await ensureRole(userId, "admin");
  }
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email y contrasena",
    credentials: {
      email: { label: "Usuario o email", type: "text" },
      password: { label: "Contrasena", type: "password" },
    },
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) {
        return null;
      }

      if (!databaseEnabled) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
      });

      if (!user || !user.passwordHash) {
        return null;
      }

      const isValid = await compare(parsed.data.password, user.passwordHash);
      if (!isValid) {
        return null;
      }

      const roles = await getRolesForUser(user.id);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        roles,
        status: user.status,
      };
    },
  }),
];

if (isGoogleOAuthConfigured()) {
  providers.unshift(
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  adapter: databaseEnabled ? PrismaAdapter(prisma) : undefined,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: env.AUTH_SECRET || "padel-quejio-fallback-insecure-secret",
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
        token.roles = user.roles ?? (await getRolesForUser(user.id));
        token.status = user.status ?? "active";
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token.userId) {
        return session;
      }

      session.user.id = token.userId;
      session.user.roles = token.roles ?? [];
      session.user.status = token.status ?? "active";

      return session;
    },
    async signIn({ user }) {
      if (!databaseEnabled) {
        return true;
      }

      if (!user.email) {
        return false;
      }

      const existing = await prisma.user.findUnique({
        where: { email: user.email.toLowerCase() },
      });

      if (!existing) {
        return true;
      }

      if (existing.status === "blocked") {
        return false;
      }

      await ensureRolesByEmail(existing.id, existing.email);

      return true;
    },
  },
  events: {
    async createUser({ user }) {
      if (!databaseEnabled) {
        return;
      }

      if (!user.email) {
        return;
      }

      await ensureRolesByEmail(user.id, user.email);
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}

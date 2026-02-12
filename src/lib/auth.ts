import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

async function getRolesForUser(userId: string) {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });

  return userRoles.map((entry) => entry.role.name);
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Email y contrasena",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contrasena", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
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
  ],
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

      const roleCount = await prisma.userRole.count({
        where: { userId: existing.id },
      });

      if (roleCount === 0) {
        const userRole = await prisma.role.findUnique({ where: { name: "user" } });
        if (userRole) {
          await prisma.userRole.create({
            data: {
              userId: existing.id,
              roleId: userRole.id,
            },
          });
        }
      }

      return true;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}

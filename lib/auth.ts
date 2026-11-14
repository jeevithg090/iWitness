import type { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";
import { isStaffRole } from "./roles";
import { credentialsSchema } from "./validation";

export const INVALID_CREDENTIALS = "Invalid email or password.";

/**
 * Verifies an email/password pair. Returns the public user on success and
 * `null` otherwise, using one generic failure so accounts can't be enumerated.
 */
export async function verifyCredentials(raw: unknown) {
  const parsed = credentialsSchema.safeParse(raw);
  if (!parsed.success) return null;

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user) return null;

  const passwordMatch = await bcrypt.compare(
    parsed.data.password,
    user.password,
  );
  if (!passwordMatch) return null;

  return {
    id: user.id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await verifyCredentials(credentials);
        if (!user) throw new Error(INVALID_CREDENTIALS);
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/** Returns the session when the caller is an ADMIN or MODERATOR, otherwise null. */
export async function getStaffSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) return null;
  return session;
}

/**
 * Grants a role to an existing account.
 *
 *   npm run user:role -- someone@example.com MODERATOR
 */
import { PrismaClient, Role } from "@prisma/client";

async function main() {
  const [email, role] = process.argv.slice(2);
  const roles = Object.values(Role);

  if (!email || !role || !roles.includes(role as Role)) {
    console.error(`Usage: npm run user:role -- <email> <${roles.join("|")}>`);
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.update({
      where: { email: email.trim().toLowerCase() },
      data: { role: role as Role },
      select: { email: true, role: true },
    });
    console.log(`${user.email} is now ${user.role}.`);
  } catch {
    console.error(`No account found for ${email}. Ask them to sign up first.`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();

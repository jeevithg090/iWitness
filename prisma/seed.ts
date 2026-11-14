/**
 * Seeds the database with an administrator account (from SEED_ADMIN_* env vars)
 * and, outside production, a handful of clearly fictional demo reports.
 *
 *   npm run db:seed
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const prisma = new PrismaClient();

const DEMO_REPORTS: Omit<Prisma.ReportCreateInput, "reportId">[] = [
  {
    type: "EMERGENCY",
    reportType: "Fire Outbreak",
    title: "Smoke coming from warehouse roof",
    description:
      "Thick grey smoke is rising from the roof of a storage warehouse near the river. No flames visible yet and the loading bay appears empty.",
    location: "Demo Industrial Estate, Unit 4",
    latitude: 12.9716,
    longitude: 77.5946,
    status: "IN_PROGRESS",
  },
  {
    type: "NON_EMERGENCY",
    reportType: "Theft",
    title: "Bicycle stolen from station rack",
    description:
      "A blue bicycle was taken from the rack outside the north entrance of the station sometime between 8am and 6pm. The lock was cut and left on the ground.",
    location: "Central Station, north entrance",
    status: "PENDING",
  },
  {
    type: "EMERGENCY",
    reportType: "Medical Emergency",
    title: "Person collapsed at bus stop",
    description:
      "An elderly person collapsed at the bus stop and is breathing but unresponsive. Bystanders are with them and an ambulance has been requested.",
    location: "Market Road bus stop",
    status: "RESOLVED",
  },
  {
    type: "NON_EMERGENCY",
    reportType: "Other",
    title: "Street lights out along park path",
    description:
      "Every street light along the east path of the park has been out for three nights, making the route unsafe to walk after dark.",
    location: "Riverside Park, east path",
    status: "PENDING",
  },
  {
    type: "NON_EMERGENCY",
    reportType: "Violence",
    title: "Repeated late-night fights outside bar",
    description:
      "For the past two weekends there have been loud fights outside the bar on the corner around closing time. Glass bottles have been thrown.",
    location: "Corner of 5th Ave and Oak St",
    status: "DISMISSED",
  },
];

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log(
      "• Skipping admin: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD.",
    );
    return;
  }
  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
  }

  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: {
      email,
      name: process.env.SEED_ADMIN_NAME || "Administrator",
      password: await bcrypt.hash(password, 12),
      role: "ADMIN",
    },
  });
  console.log(`• Admin account ready: ${email}`);
}

async function seedDemoReports() {
  if (process.env.NODE_ENV === "production") {
    console.log("• Skipping demo reports in production.");
    return;
  }
  const existing = await prisma.report.count();
  if (existing > 0) {
    console.log(
      `• Skipping demo reports: ${existing} report(s) already exist.`,
    );
    return;
  }
  const day = 24 * 60 * 60 * 1000;
  for (const [i, report] of DEMO_REPORTS.entries()) {
    await prisma.report.create({
      data: {
        ...report,
        reportId: randomBytes(8).toString("hex"),
        createdAt: new Date(Date.now() - i * day),
      },
    });
  }
  console.log(`• Created ${DEMO_REPORTS.length} demo reports.`);
}

async function main() {
  await seedAdmin();
  await seedDemoReports();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

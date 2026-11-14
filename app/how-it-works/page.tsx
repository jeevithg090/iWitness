import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardEdit,
  EyeOff,
  Fingerprint,
  Info,
  KeyRound,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Alert } from "@/components/ui/alert";
import { EMERGENCY_NUMBER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How iWitness collects anonymous incident reports and what happens after you submit one.",
};

const STEPS = [
  {
    icon: ClipboardEdit,
    title: "Submit your report",
    description:
      "Pick emergency or non-emergency, choose a category and describe what happened. You can attach one photo and add a location by address search or GPS. No name, email or account is needed.",
  },
  {
    icon: Fingerprint,
    title: "Optional AI assistance",
    description:
      "If you attach a photo, it is sent to Google Gemini to suggest a title, category and description. You can edit or discard every suggestion before submitting.",
  },
  {
    icon: KeyRound,
    title: "Receive a private report ID",
    description:
      "The server generates a random 16-character ID for your report. Keep it somewhere safe: it is the only way to look the report up again.",
  },
  {
    icon: ListChecks,
    title: "Moderators review and act",
    description:
      "Signed-in moderators see new reports in a dashboard, review the details and move them through Pending, In progress, Resolved or Dismissed.",
  },
];

const PRIVACY = [
  {
    icon: EyeOff,
    title: "No identity collected",
    description:
      "Reports have no link to an account, and the form never asks who you are.",
  },
  {
    icon: ShieldCheck,
    title: "Limited public lookups",
    description:
      "Tracking a report shows its status, title and dates only, never the location or photo.",
  },
  {
    icon: KeyRound,
    title: "Staff-only details",
    description:
      "Full report details and evidence images are only available to authorised moderators.",
  },
];

export default function HowItWorks() {
  return (
    <div className="container py-16 sm:py-20">
      <PageHeader
        eyebrow="Understanding the process"
        eyebrowIcon={<Info aria-hidden="true" />}
        title="How iWitness works"
        description="What happens to your report from the moment you press submit, and how your anonymity is protected along the way."
      />

      <ol className="mx-auto mt-16 max-w-3xl space-y-4">
        {STEPS.map(({ icon: Icon, title, description }, i) => (
          <li
            key={title}
            className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:gap-6 sm:p-6"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                Step 0{i + 1}
              </p>
              <h2 className="mt-1 text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <section
        aria-labelledby="privacy-heading"
        className="mx-auto mt-20 max-w-5xl"
      >
        <h2
          id="privacy-heading"
          className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
        >
          How your privacy is protected
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {PRIVACY.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="rounded-xl border border-border bg-card p-6 text-center"
            >
              <span className="mx-auto flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ul>
        <Alert
          tone="warning"
          title="Anonymity has limits"
          className="mx-auto mt-8 max-w-3xl"
        >
          Details you write, photo contents and precise GPS coordinates can
          still identify you. Only share what you&apos;re comfortable with. If
          someone is in immediate danger, call {EMERGENCY_NUMBER} first.
        </Alert>
      </section>

      <div className="mt-20 text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Ready to make a report?
        </h2>
        <Link
          href="/submit-report"
          className={`${buttonVariants({ size: "lg" })} mt-6`}
        >
          Start an anonymous report
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import {
  ArrowRight,
  Camera,
  EyeOff,
  LayoutDashboard,
  Lock,
  MapPin,
  Search,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: EyeOff,
    title: "No account, no name",
    description:
      "Submit without signing up. We never ask who you are, and reports aren't linked to any user record.",
  },
  {
    icon: Camera,
    title: "AI-assisted details",
    description:
      "Attach a photo and Gemini suggests a title, category and description you can review and edit.",
  },
  {
    icon: MapPin,
    title: "Precise location",
    description:
      "Search an address or share your GPS position with one tap, only if you choose to.",
  },
  {
    icon: Search,
    title: "Private tracking ID",
    description:
      "Every report gets a random 16-character ID. Use it to check progress at any time.",
  },
  {
    icon: LayoutDashboard,
    title: "Moderator dashboard",
    description:
      "Authorised moderators filter, review and update the status of incoming reports.",
  },
  {
    icon: Lock,
    title: "Minimal public data",
    description:
      "Status lookups never reveal the location, description or photo attached to a report.",
  },
];

const STEPS = [
  {
    title: "Describe the incident",
    text: "Choose emergency or non-emergency, add details and an optional photo.",
  },
  {
    title: "Save your report ID",
    text: "You receive a private tracking ID the moment the report is filed.",
  },
  {
    title: "Follow its progress",
    text: "Moderators review the report and update its status as they act on it.",
  },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_40%,transparent)]"
        />
        <div className="container flex flex-col items-center py-20 text-center sm:py-28">
          <p className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-sm font-medium text-accent-foreground">
            <Lock className="size-4" aria-hidden="true" />
            Anonymous by design
          </p>
          <h1 className="mt-8 max-w-4xl animate-fade-up text-balance text-5xl font-bold tracking-tight [animation-delay:60ms] sm:text-6xl lg:text-7xl">
            Report incidents.
            <span className="block bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent dark:from-sky-400 dark:to-blue-500">
              Protect your identity.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl animate-fade-up text-balance text-lg leading-relaxed text-muted-foreground [animation-delay:120ms]">
            iWitness lets anyone report theft, violence, fires and other
            incidents in their community without revealing who they are, then
            track what happens next.
          </p>
          <div className="mt-10 flex w-full animate-fade-up flex-col gap-3 [animation-delay:180ms] sm:w-auto sm:flex-row">
            <Link
              href="/submit-report"
              className={cn(buttonVariants({ size: "lg" }), "group")}
            >
              Make an anonymous report
              <ArrowRight
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/track-report"
              className={buttonVariants({ size: "lg", variant: "secondary" })}
            >
              Track a report
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="features-heading"
        className="container pb-20 sm:pb-28"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="features-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Built for people who need to speak up safely
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything a witness needs to share what they saw, and nothing that
            identifies them.
          </p>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="steps-heading"
        className="border-y border-border bg-muted/40"
      >
        <div className="container py-20 sm:py-24">
          <h2
            id="steps-heading"
            className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Three steps, about two minutes
          </h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="relative rounded-xl border border-border bg-card p-6"
              >
                <span className="font-mono text-sm font-semibold text-primary">
                  0{i + 1}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Link
              href="/how-it-works"
              className={buttonVariants({ variant: "link" })}
            >
              Learn how your anonymity is protected
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-20 sm:py-24">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-sky-500/15 via-card to-blue-600/10 px-6 py-12 text-center sm:px-12">
          <h2 className="text-balance text-3xl font-bold tracking-tight">
            Seen something? Say something.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Your report could help someone. It only takes a couple of minutes,
            and you stay anonymous.
          </p>
          <Link
            href="/submit-report"
            className={cn(buttonVariants({ size: "lg" }), "mt-8")}
          >
            Start a report
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}

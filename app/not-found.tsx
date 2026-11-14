import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="size-7" aria-hidden="true" />
      </span>
      <p className="mt-6 font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={buttonVariants()}>
          Back to home
        </Link>
        <Link
          href="/track-report"
          className={buttonVariants({ variant: "secondary" })}
        >
          Track a report
        </Link>
      </div>
    </section>
  );
}

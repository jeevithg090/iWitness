"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlert className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <Button className="mt-8" onClick={reset}>
        <RotateCcw aria-hidden="true" />
        Try again
      </Button>
    </section>
  );
}

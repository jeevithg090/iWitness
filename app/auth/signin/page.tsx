import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/signin-form";

export const metadata: Metadata = {
  title: "Moderator sign in",
  description: "Sign in to the iWitness moderator dashboard.",
};

export default function SignInPage() {
  return (
    <AuthShell
      title="Moderator sign in"
      description="Access the dashboard to review incoming reports."
      footer={
        <>
          Need an account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-primary hover:underline"
          >
            Request access
          </Link>
          <br />
          <span className="mt-2 inline-block">
            Reporting an incident? You don&apos;t need to sign in.{" "}
            <Link
              href="/submit-report"
              className="font-medium text-primary hover:underline"
            >
              Submit a report
            </Link>
          </span>
        </>
      }
    >
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Request moderator access",
  description:
    "Create an iWitness staff account. An administrator must approve moderator access.",
};

export default function SignUpPage() {
  return (
    <AuthShell
      title="Request moderator access"
      description="Create a staff account. An administrator will grant dashboard access."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}

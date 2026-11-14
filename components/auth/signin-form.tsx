"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn, signOut } from "next-auth/react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { isStaffRole } from "@/lib/roles";

const NO_ACCESS =
  "Your account doesn't have moderator access yet. Ask an administrator to grant you the MODERATOR role.";

/** Only allow same-site relative redirects. */
function safeCallback(url: string | null): string {
  return url && url.startsWith("/") && !url.startsWith("//")
    ? url
    : "/dashboard";
}

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeCallback(params.get("callbackUrl"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") === "AccessDenied" ? NO_ACCESS : null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!result || result.error) {
        setError("Invalid email or password.");
        return;
      }
      const session = await getSession();
      if (!isStaffRole(session?.user?.role)) {
        await signOut({ redirect: false });
        setError(NO_ACCESS);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong while signing in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error && <Alert tone="error">{error}</Alert>}
      <Field id="email" label="Email">
        {(props) => (
          <Input
            {...props}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        )}
      </Field>
      <Field id="password" label="Password">
        {(props) => (
          <Input
            {...props}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
      </Field>
      <Button type="submit" className="w-full" loading={loading}>
        {!loading && <LogIn aria-hidden="true" />}
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, UserPlus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { fieldErrors, signupSchema } from "@/lib/validation";

const EMPTY = { name: "", email: "", password: "", confirmPassword: "" };

export function SignUpForm() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsed = signupSchema.safeParse(form);
    const errs = parsed.success ? {} : fieldErrors(parsed.error);
    if (form.password && form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords don't match.";
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        throw new Error(data.error || "Could not create your account.");
      }
      setDone(true);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not create your account.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-4 text-center" role="status">
        <CheckCircle2
          className="mx-auto size-10 text-success"
          aria-hidden="true"
        />
        <h2 className="text-lg font-semibold">Account created</h2>
        <p className="text-sm text-muted-foreground">
          An administrator needs to grant your account moderator access before
          you can open the dashboard.
        </p>
        <Link
          href="/auth/signin"
          className={buttonVariants({ className: "w-full" })}
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && <Alert tone="error">{formError}</Alert>}
      <Field id="name" label="Full name" error={errors.name}>
        {(props) => (
          <Input
            {...props}
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={onChange}
          />
        )}
      </Field>
      <Field id="email" label="Email" error={errors.email}>
        {(props) => (
          <Input
            {...props}
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={onChange}
          />
        )}
      </Field>
      <Field
        id="password"
        label="Password"
        error={errors.password}
        hint="At least 8 characters."
      >
        {(props) => (
          <Input
            {...props}
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={onChange}
          />
        )}
      </Field>
      <Field
        id="confirmPassword"
        label="Confirm password"
        error={errors.confirmPassword}
      >
        {(props) => (
          <Input
            {...props}
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={onChange}
          />
        )}
      </Field>
      <Button type="submit" className="w-full" loading={loading}>
        {!loading && <UserPlus aria-hidden="true" />}
        {loading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}

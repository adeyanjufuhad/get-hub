"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { GoogleAuthButton, oauthErrorMessage } from "@/components/auth/google-auth-button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { ApiError, api } from "@/lib/api";
import { APP_NAME } from "@/lib/config";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = oauthErrorMessage(searchParams.get("error"));
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { user } = await api.login({ email, password });
      setUser(user);
      toast.success(`Welcome back, ${user.full_name.split(" ")[0]}!`);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Could not connect to server.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 sm:p-7">
      <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
        Welcome back
      </h1>
      <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
        Pick up right where you stopped.
      </p>

      {oauthError && (
        <div className="mt-4 rounded-xl bg-[var(--danger-soft)] px-3.5 py-2.5 text-xs font-medium text-[var(--danger)]">
          {oauthError} You can also use email &amp; password.
        </div>
      )}

      <GoogleAuthButton dividerLabel="or use email" />

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-[var(--text-primary)]">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            autoCapitalize="none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1.5 min-h-[46px] w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-[var(--text-primary)]">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="mt-1.5 min-h-[46px] w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
        </div>

        <Button type="submit" variant="ink" size="lg" disabled={submitting} className="w-full">
          {submitting ? "Signing in…" : "Log in"}
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
        New to {APP_NAME}?{" "}
        <Link href="/signup" className="font-semibold text-[var(--accent)]">
          Create a free account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col justify-center bg-[var(--bg-canvas)] px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2.5">
          <BrandLogo size="md" />
          <span className="text-base font-extrabold tracking-tight">{APP_NAME}</span>
        </Link>
        <Suspense fallback={<div className="h-96 rounded-[24px] bg-[var(--bg-surface)]" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

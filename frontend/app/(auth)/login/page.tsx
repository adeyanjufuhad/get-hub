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
import { PasswordInput } from "@/components/ui/password-input";
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
    /* Concentric card: Outer 28px (12+16) mobile / 32px (12+20) sm -> inner inputs & buttons 12px */
    <div className="rounded-[28px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:rounded-[32px] sm:p-5">
      <h1 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-2xl">
        Welcome back
      </h1>
      <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
        Pick up right where you stopped.
      </p>

      {oauthError && (
        <div
          role="alert"
          aria-live="polite"
          className="mt-4 rounded-[12px] bg-[var(--danger-soft)] px-3.5 py-2.5 text-xs font-medium text-[var(--danger)]"
        >
          {oauthError} Sign in with your email and password below instead.
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
            name="email"
            type="email"
            enterKeyHint="next"
            required
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tunde@student.oauife.edu.ng…"
            className="mt-1.5 min-h-[46px] w-full rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 text-[var(--text-primary)]"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-[var(--text-primary)]">
            Password
          </label>
          <PasswordInput
            id="password"
            name="password"
            enterKeyHint="go"
            wrapperClassName="mt-1.5"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password…"
            className="min-h-[46px] w-full rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 text-[var(--text-primary)]"
          />
        </div>

        <Button type="submit" variant="ink" size="lg" disabled={submitting} className="w-full">
          {submitting ? "Signing in…" : "Log in"}
          {!submitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
        New to <span translate="no">{APP_NAME}</span>?{" "}
        <Link href="/signup" className="font-semibold text-[var(--accent)] hover:underline">
          Create a student account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col justify-center bg-[var(--bg-canvas)] px-4 py-6 sm:px-6 sm:py-10">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-md outline-none">
        <Link href="/" className="mb-5 inline-flex items-center gap-2.5 sm:mb-6">
          <BrandLogo size="md" />
          <span translate="no" className="text-base font-extrabold tracking-tight">
            {APP_NAME}
          </span>
        </Link>
        <Suspense fallback={<div className="h-96 rounded-[24px] bg-[var(--bg-surface)]" />}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}

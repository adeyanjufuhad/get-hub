"use client";

import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { ApiError, api } from "@/lib/api";
import { APP_NAME } from "@/lib/config";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
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
          Google sign-in could not complete ({oauthError}). Try again or use email &amp; password.
        </div>
      )}

      <a
        href={api.googleAuthStartUrl()}
        className="pressable mt-5 flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 text-sm font-semibold text-[var(--text-primary)]"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1C3.3 21.3 7.3 24 12 24z" />
          <path fill="#FBBC05" d="M5.3 14.2c-.2-.7-.4-1.5-.4-2.2s.1-1.5.4-2.2V6.7H1.3C.5 8.3 0 10.1 0 12s.5 3.7 1.3 5.3l4-3.1z" />
          <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.7l4 3.1c.9-2.9 3.6-5 6.7-5z" />
        </svg>
        Continue with Google
      </a>

      <div className="my-5 flex items-center gap-3 text-xs text-[var(--text-muted)]">
        <span className="h-px flex-1 bg-[var(--border-hairline)]" />
        <span>or use email</span>
        <span className="h-px flex-1 bg-[var(--border-hairline)]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ink-cta)] text-[var(--ink-cta-text)]">
            <Compass className="h-5 w-5" />
          </span>
          <span className="text-base font-extrabold tracking-tight">{APP_NAME}</span>
        </Link>
        <Suspense fallback={<div className="h-96 rounded-[24px] bg-[var(--bg-surface)]" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

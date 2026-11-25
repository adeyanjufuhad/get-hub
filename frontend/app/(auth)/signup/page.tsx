"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { ApiError, api } from "@/lib/api";
import { APP_NAME, DEFAULT_STUDY_LEVEL, OAU_DEPARTMENTS } from "@/lib/config";

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState<string>(OAU_DEPARTMENTS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    try {
      const { user } = await api.register({
        full_name: fullName,
        email,
        password,
        department,
        level: DEFAULT_STUDY_LEVEL,
      });
      setUser(user);
      toast.success(`Welcome to ${APP_NAME}, ${user.full_name.split(" ")[0]}!`);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields) setFieldErrors(err.fields);
        toast.error(err.message);
      } else {
        toast.error("Could not connect to server. Check your connection.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-[var(--bg-canvas)] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-5 inline-flex items-center gap-2.5 sm:mb-6">
          <BrandLogo size="md" />
          <span className="text-base font-extrabold tracking-tight">{APP_NAME}</span>
        </Link>

        <div className="rounded-[22px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 sm:rounded-[24px] sm:p-7">
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-2xl">
            Create your student account
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Track your GET 205, 207 &amp; 209 progress across every device.
          </p>

          <GoogleAuthButton dividerLabel="or sign up with email" />

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-xs font-semibold text-[var(--text-primary)]">
                Full name
              </label>
              <input
                id="full_name"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Tunde Adebayo"
                className="mt-1.5 min-h-[46px] w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
              {fieldErrors.full_name && (
                <p className="mt-1 text-xs text-[var(--danger)]">{fieldErrors.full_name}</p>
              )}
            </div>

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
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-[var(--danger)]">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="department" className="block text-xs font-semibold text-[var(--text-primary)]">
                OAU Department (200L)
              </label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="mt-1.5 min-h-[46px] w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              >
                {OAU_DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {fieldErrors.department && (
                <p className="mt-1 text-xs text-[var(--danger)]">{fieldErrors.department}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-[var(--text-primary)]">
                Password (min. 8 characters)
              </label>
              <PasswordInput
                id="password"
                wrapperClassName="mt-1.5"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="min-h-[46px] w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-[var(--danger)]">{fieldErrors.password}</p>
              )}
            </div>

            <Button type="submit" variant="ink" size="lg" disabled={submitting} className="w-full">
              {submitting ? "Creating account…" : "Start studying"}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--accent)]">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

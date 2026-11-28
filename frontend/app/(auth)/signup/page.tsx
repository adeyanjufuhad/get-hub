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
import { APP_NAME, DEFAULT_DEPARTMENT, DEFAULT_STUDY_LEVEL, OAU_FACULTIES } from "@/lib/config";

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState<string>(DEFAULT_DEPARTMENT);
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
      toast.success("Account created");
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields) setFieldErrors(err.fields);
        toast.error(err.message);
      } else {
        toast.error("Could not connect to server");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-[var(--bg-canvas)] px-4 py-6 sm:px-6 sm:py-10">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-md outline-none">
        <Link href="/" className="mb-5 inline-flex items-center gap-2.5 sm:mb-6">
          <BrandLogo size="md" />
          <span translate="no" className="text-base font-semibold tracking-tight">
            {APP_NAME}
          </span>
        </Link>

        {/* Concentric card: Outer 28px (12+16) mobile / 32px (12+20) sm -> inner inputs & buttons 12px */}
        <div className="rounded-[28px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:rounded-[32px] sm:p-5">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">
            Create your student account
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Save your <span translate="no">GET 205, 207 &amp; 209</span> progress across every device.
          </p>

          <GoogleAuthButton dividerLabel="or sign up with email" />

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-xs font-semibold text-[var(--text-primary)]">
                Full name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                enterKeyHint="next"
                required
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.full_name)}
                aria-describedby={fieldErrors.full_name ? "err-full-name" : undefined}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tunde Adebayo…"
                className="mt-1.5 min-h-[46px] w-full rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 text-[var(--text-primary)]"
              />
              {fieldErrors.full_name && (
                <p id="err-full-name" role="alert" className="mt-1 text-xs text-[var(--danger)]">
                  {fieldErrors.full_name}
                </p>
              )}
            </div>

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
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "err-email" : undefined}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tunde@student.oauife.edu.ng…"
                className="mt-1.5 min-h-[46px] w-full rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 text-[var(--text-primary)]"
              />
              {fieldErrors.email && (
                <p id="err-email" role="alert" className="mt-1 text-xs text-[var(--danger)]">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="department" className="block text-xs font-semibold text-[var(--text-primary)]">
                OAU Department (200L)
              </label>
              <select
                id="department"
                name="department"
                aria-invalid={Boolean(fieldErrors.department)}
                aria-describedby={fieldErrors.department ? "err-department" : undefined}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="mt-1.5 min-h-[46px] w-full rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 text-[var(--text-primary)]"
              >
                {OAU_FACULTIES.map((f) => (
                  <optgroup key={f.name} label={f.name}>
                    {f.departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {fieldErrors.department && (
                <p id="err-department" role="alert" className="mt-1 text-xs text-[var(--danger)]">
                  {fieldErrors.department}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-[var(--text-primary)]">
                Password (min. 8 characters)
              </label>
              <PasswordInput
                id="password"
                name="password"
                enterKeyHint="done"
                wrapperClassName="mt-1.5"
                required
                minLength={8}
                autoComplete="new-password"
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "err-password" : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create an 8+ character password…"
                className="min-h-[46px] w-full rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 text-[var(--text-primary)]"
              />
              {fieldErrors.password && (
                <p id="err-password" role="alert" className="mt-1 text-xs text-[var(--danger)]">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <Button type="submit" variant="ink" size="lg" disabled={submitting} className="w-full">
              {submitting ? "Creating account…" : "Create student account"}
              {!submitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { ApiError, api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { OAU_FACULTIES, STUDY_LEVELS, facultyOf, type OauFaculty } from "@/lib/config";

const INPUT =
  "mt-1.5 min-h-[44px] w-full rounded-[12px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 text-[var(--text-primary)] outline-none transition-colors focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20 aria-[invalid=true]:border-[var(--danger)] disabled:cursor-not-allowed disabled:text-[var(--text-muted)]";

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "GH"
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, setUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [faculty, setFaculty] = useState<OauFaculty>(OAU_FACULTIES[0].name);
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    setFullName(user.full_name);
    setFaculty(facultyOf(user.department));
    setDepartment(user.department);
    setLevel(user.level);
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-16 w-72 rounded-[12px] bg-[var(--bg-surface)]" />
        <div className="h-96 rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]" />
      </div>
    );
  }

  const departments: readonly string[] =
    OAU_FACULTIES.find((f) => f.name === faculty)?.departments ?? [];
  const dirty =
    fullName.trim() !== user.full_name || department !== user.department || level !== user.level;
  const joined = new Date(user.created_at);

  function changeFaculty(next: OauFaculty) {
    setFaculty(next);
    const list: readonly string[] = OAU_FACULTIES.find((f) => f.name === next)?.departments ?? [];
    // Keep the department only if it belongs to the newly chosen faculty.
    if (!list.includes(department)) setDepartment("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const local: Record<string, string> = {};
    if (fullName.trim().length < 2) local.full_name = "Enter your full name (2–100 characters).";
    if (!department) local.department = "Choose your department.";
    setErrors(local);
    if (Object.keys(local).length > 0) return;

    setSaving(true);
    try {
      const { user: updated } = await api.updateProfile({
        full_name: fullName.trim(),
        department,
        level,
      });
      setUser(updated);
      toast.success("Profile saved");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields) setErrors(err.fields);
        toast.error(err.message);
      } else {
        toast.error("Could not connect to server");
      }
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    if (!user) return;
    setFullName(user.full_name);
    setFaculty(facultyOf(user.department));
    setDepartment(user.department);
    setLevel(user.level);
    setErrors({});
  }

  async function handleSignOut() {
    try {
      await api.logout();
    } catch {
      // Ignore network errors on sign-out.
    }
    setUser(null);
    toast.success("Signed out");
    router.push("/login");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Identity */}
      <header className="flex items-center gap-4">
        <span
          aria-hidden="true"
          translate="no"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] text-lg font-bold text-white"
          style={{ backgroundColor: user.avatar_color || "#EA580C" }}
        >
          {initialsOf(user.full_name)}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{user.full_name}</h1>
          <p className="truncate text-sm text-[var(--text-secondary)]">
            {user.department} · {user.level}
          </p>
        </div>
      </header>

      {/* Details form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-labelledby="details-heading"
        className="rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]"
      >
        <div className="border-b border-[var(--border-hairline)] p-4 sm:p-5">
          <h2 id="details-heading" className="text-base font-semibold">
            Your details
          </h2>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            Your department and level appear across the app.
          </p>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
          <Field label="Full name" error={errors.full_name} className="sm:col-span-2">
            {(id, describedBy) => (
              <input
                id={id}
                type="text"
                autoComplete="name"
                maxLength={100}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                aria-invalid={Boolean(errors.full_name)}
                aria-describedby={describedBy}
                className={INPUT}
              />
            )}
          </Field>

          <Field
            label="Email"
            hint="Your sign-in email can't be changed here."
            className="sm:col-span-2"
          >
            {(id, describedBy) => (
              <input
                id={id}
                type="email"
                value={user.email}
                disabled
                aria-describedby={describedBy}
                className={INPUT}
              />
            )}
          </Field>

          <Field label="Faculty">
            {(id) => (
              <select
                id={id}
                value={faculty}
                onChange={(e) => changeFaculty(e.target.value as OauFaculty)}
                className={INPUT}
              >
                {OAU_FACULTIES.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field label="Level" error={errors.level}>
            {(id, describedBy) => (
              <select
                id={id}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                aria-invalid={Boolean(errors.level)}
                aria-describedby={describedBy}
                className={INPUT}
              >
                {STUDY_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field label="Department" error={errors.department} className="sm:col-span-2">
            {(id, describedBy) => (
              <select
                id={id}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                aria-invalid={Boolean(errors.department)}
                aria-describedby={describedBy}
                className={INPUT}
              >
                <option value="" disabled>
                  Choose your department
                </option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-[var(--border-hairline)] p-4 sm:p-5">
          {dirty && (
            <button
              type="button"
              onClick={reset}
              className="cursor-pointer text-sm text-[var(--text-secondary)] underline-offset-4 hover:text-[var(--text-primary)] hover:underline"
            >
              Discard changes
            </button>
          )}
          <button
            type="submit"
            disabled={!dirty || saving}
            className="pressable inline-flex min-h-[40px] cursor-pointer items-center rounded-[12px] bg-[var(--ink-cta)] px-5 text-sm font-medium text-[var(--ink-cta-text)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      {/* Account */}
      <section
        aria-labelledby="account-heading"
        className="divide-y divide-[var(--border-hairline)] rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]"
      >
        <h2 id="account-heading" className="p-4 text-base font-semibold sm:px-5">
          Account
        </h2>
        <dl className="divide-y divide-[var(--border-hairline)] text-sm">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
            <dt className="text-[var(--text-secondary)]">Account type</dt>
            <dd className="font-medium capitalize">{user.role}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
            <dt className="text-[var(--text-secondary)]">Member since</dt>
            <dd className="tabular font-medium">
              {Number.isNaN(joined.getTime())
                ? "—"
                : joined.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
            </dd>
          </div>
        </dl>
        <div className="p-4 sm:px-5">
          <button
            type="button"
            onClick={handleSignOut}
            className="pressable inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-[12px] border border-[var(--border-hairline)] px-4 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--danger)]/30 hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: (id: string, describedBy: string | undefined) => ReactNode;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  // The hint is hidden while an error shows, so point at whichever is rendered.
  const describedBy = error ? errorId : hint ? hintId : undefined;
  return (
    <div className={cn(className)}>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      {children(id, describedBy)}
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-[var(--text-muted)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-[var(--danger)]">
          {error}
        </p>
      )}
    </div>
  );
}

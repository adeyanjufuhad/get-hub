"use client";

import {
  BookMarked,
  Download,
  FileText,
  Loader2,
  Presentation,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { ApiError, api } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { LibraryMaterial, LibraryMaterialKind, LibraryPayload } from "@/lib/types";

const KIND_LABELS: Record<LibraryMaterialKind, string> = {
  lecture_notes: "Lecture notes",
  past_questions: "Past questions",
  tutorial: "Tutorials",
  student_notes: "Class notes",
  lab_manual: "Lab manuals",
  handout: "Handouts",
};

const KIND_ORDER: LibraryMaterialKind[] = [
  "lecture_notes",
  "past_questions",
  "tutorial",
  "student_notes",
  "lab_manual",
  "handout",
];

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function isSlides(m: LibraryMaterial): boolean {
  return /\.pptx?$/i.test(m.file_name);
}

export default function LibraryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<LibraryPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState<string>("all");
  const [kind, setKind] = useState<LibraryMaterialKind | "all">("all");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    api
      .library()
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load the library."));
  }, [authLoading, user, router]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.materials.filter((m) => {
      if (course !== "all" && m.course_code !== course) return false;
      if (kind !== "all" && m.kind !== kind) return false;
      if (!q) return true;
      return (
        m.title.toLowerCase().includes(q) ||
        m.course_code.toLowerCase().includes(q) ||
        m.course_code.replace(" ", "").toLowerCase().includes(q) ||
        m.credit.toLowerCase().includes(q)
      );
    });
  }, [data, query, course, kind]);

  const grouped = useMemo(() => {
    if (!data) return [];
    return data.courses
      .map((c) => ({ course: c, items: filtered.filter((m) => m.course_code === c.code) }))
      .filter((g) => g.items.length > 0);
  }, [data, filtered]);

  const kindsPresent = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.materials.map((m) => m.kind));
    return KIND_ORDER.filter((k) => set.has(k));
  }, [data]);

  async function handleDownload(m: LibraryMaterial) {
    setDownloadingId(m.id);
    try {
      const { url } = await api.libraryDownloadLink(m.id);
      // Navigating to the signed URL triggers the browser's own download (Content-Disposition: attachment).
      window.location.assign(url);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Download failed. Check your connection and try again.");
    } finally {
      setTimeout(() => setDownloadingId((id) => (id === m.id ? null : id)), 1200);
    }
  }

  if (authLoading || (!data && !error)) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-20 animate-pulse rounded-[24px] bg-[var(--bg-surface)]" />
        <div className="h-12 animate-pulse rounded-full bg-[var(--bg-surface)]" />
        <div className="h-72 animate-pulse rounded-[24px] bg-[var(--bg-surface)]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 text-sm text-[var(--text-secondary)]">
        {error}
      </div>
    );
  }

  const totalBytes = data.materials.reduce((sum, m) => sum + m.size_bytes, 0);
  const filtersActive = query !== "" || course !== "all" || kind !== "all";

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
            Part 2 · Notes library
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
            Lecture notes &amp; past questions
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--text-secondary)] text-pretty">
            {data.materials.length} files across {data.courses.length} courses, shared by students for students. Sizes are
            shown so you can plan your data.
          </p>
        </div>
        <p className="tabular shrink-0 font-mono text-xs text-[var(--text-muted)]">
          {formatSize(totalBytes)} total
        </p>
      </header>

      {!data.downloads_enabled && (
        <div className="rounded-2xl border border-[var(--warning)]/30 bg-[var(--warning-soft)] px-4 py-3 text-xs font-medium text-[var(--warning)]">
          Downloads are switched off on this server right now. You can still browse the list.
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3">
        <label className="relative block">
          <span className="sr-only">Search the library</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search e.g. “past question”, “MTH 201”, “thermodynamics”"
            className="min-h-[48px] w-full rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] pl-11 pr-11 text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] sm:text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>

        {/* Course chips: one scrollable row on phones, wraps on larger screens */}
        <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap" role="group" aria-label="Filter by course">
            <Chip active={course === "all"} onClick={() => setCourse("all")}>
              All courses
            </Chip>
            {data.courses.map((c) => (
              <Chip
                key={c.code}
                active={course === c.code}
                onClick={() => setCourse(course === c.code ? "all" : c.code)}
                title={`${c.code}: ${c.title}`}
                mono
              >
                {c.code}
                <span className="tabular opacity-60">{c.material_count}</span>
              </Chip>
            ))}
          </div>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap" role="group" aria-label="Filter by type">
            <Chip small active={kind === "all"} onClick={() => setKind("all")}>
              Every type
            </Chip>
            {kindsPresent.map((k) => (
              <Chip small key={k} active={kind === k} onClick={() => setKind(kind === k ? "all" : k)}>
                {KIND_LABELS[k]}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <p className="text-xs text-[var(--text-muted)]" aria-live="polite">
        {filtered.length === data.materials.length
          ? `Showing all ${filtered.length} files`
          : `${filtered.length} of ${data.materials.length} files`}
        {filtersActive && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCourse("all");
              setKind("all");
            }}
            className="ml-2 font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Reset filters
          </button>
        )}
      </p>

      {grouped.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[var(--border-hairline)] bg-[var(--bg-surface)] px-6 py-12 text-center">
          <BookMarked className="mx-auto h-6 w-6 text-[var(--text-muted)]" />
          <p className="mt-3 text-sm font-semibold">Nothing matches that search</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Try a course code like “EEE 251” or a word like “test”.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ course: c, items }) => (
            <section key={c.code} aria-labelledby={`lib-${c.code}`}>
              <div className="mb-2.5 flex items-baseline justify-between gap-3 px-1">
                <h2 id={`lib-${c.code}`} className="min-w-0 text-sm font-bold">
                  <span className="font-mono text-[var(--accent)]">{c.code}</span>
                  <span className="text-[var(--text-secondary)]"> · {c.title}</span>
                </h2>
                <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
                  {c.semester === 1 ? "1st sem" : "2nd sem"}
                </span>
              </div>
              <ul className="divide-y divide-[var(--border-hairline)] overflow-hidden rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                {items.map((m) => {
                  const Icon = isSlides(m) ? Presentation : FileText;
                  const busy = downloadingId === m.id;
                  return (
                    <li key={m.id} className="flex items-center gap-3 px-3.5 py-3 sm:px-4">
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          m.kind === "past_questions"
                            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                            : "bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
                        )}
                        aria-hidden="true"
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-snug text-[var(--text-primary)] [overflow-wrap:anywhere]">
                          {m.title}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-[var(--text-muted)]">
                          <span>{KIND_LABELS[m.kind]}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular">{formatSize(m.size_bytes)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="uppercase">{m.file_name.split(".").pop()}</span>
                          {m.credit && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>by {m.credit}</span>
                            </>
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownload(m)}
                        disabled={!data.downloads_enabled || busy}
                        aria-label={`Download ${m.course_code} ${m.title} (${formatSize(m.size_bytes)})`}
                        className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50 sm:w-auto sm:gap-1.5 sm:px-4"
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        <span className="hidden text-xs font-semibold sm:inline">{busy ? "Preparing" : "Download"}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <aside className="rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 text-xs leading-relaxed text-[var(--text-secondary)]">
        <p>
          <span className="font-semibold text-[var(--text-primary)]">Looking for textbooks?</span> Published textbooks
          aren&apos;t hosted here. See the{" "}
          <Link href="/dashboard#textbooks" className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline">
            recommended textbooks
          </Link>{" "}
          for the editions and chapters to borrow from the library.
        </p>
        <p className="mt-2">
          Shared one of these and want it taken down or credited differently? Tell the GET Hub team and it will be updated.
        </p>
      </aside>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  title,
  mono,
  small,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className={cn(
        "pressable inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border font-semibold transition-colors",
        small ? "min-h-[40px] px-3.5 text-xs" : "min-h-[44px] px-4 text-xs",
        mono && "font-mono",
        active
          ? "border-[var(--ink-cta)] bg-[var(--ink-cta)] text-[var(--ink-cta-text)]"
          : "border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      )}
    >
      {children}
    </button>
  );
}

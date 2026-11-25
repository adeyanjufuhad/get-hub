"use client";

import {
  CheckCircle2,
  Eye,
  Plus,
  ShieldAlert,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MathText } from "@/components/ui/math-text";
import { ApiError, api } from "@/lib/api";
import type {
  AdminOption,
  AdminQuestion,
  AdminTopicMeta,
  ContentStatus,
  Course,
  Difficulty,
  QuestionSource,
  QuestionType,
} from "@/lib/types";

const EMPTY_OPTIONS: AdminOption[] = [
  { label: "A", content_md: "", image_url: "", is_correct: true },
  { label: "B", content_md: "", image_url: "", is_correct: false },
  { label: "C", content_md: "", image_url: "", is_correct: false },
  { label: "D", content_md: "", image_url: "", is_correct: false },
];

export default function AdminQuestionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [topics, setTopics] = useState<AdminTopicMeta[]>([]);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterCourse, setFilterCourse] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [courseId, setCourseId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("mcq");
  const [promptMd, setPromptMd] = useState("");
  const [promptImageUrl, setPromptImageUrl] = useState("");
  const [numericAnswer, setNumericAnswer] = useState("");
  const [tolerancePct, setTolerancePct] = useState("1");
  const [numericUnit, setNumericUnit] = useState("");
  const [solutionMd, setSolutionMd] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [source, setSource] = useState<QuestionSource>("original");
  const [year, setYear] = useState("");
  const [status, setStatus] = useState<ContentStatus>("draft");
  const [isFree, setIsFree] = useState(true);
  const [tagsText, setTagsText] = useState("");
  const [options, setOptions] = useState<AdminOption[]>(EMPTY_OPTIONS);
  const [saving, setSaving] = useState(false);

  const topicsForCourse = useMemo(
    () => topics.filter((t) => !courseId || t.course_id === courseId),
    [topics, courseId]
  );

  async function reloadQuestions(cFilter = filterCourse, sFilter = filterStatus) {
    const res = await api.admin.listQuestions({
      course_id: cFilter || undefined,
      status: sFilter || undefined,
    });
    setQuestions(res.questions);
  }

  useEffect(() => {
    if (authLoading || user?.role !== "admin") {
      setLoading(false);
      return;
    }
    Promise.all([api.admin.metadata(), api.admin.listQuestions()])
      .then(([meta, qRes]) => {
        setCourses(meta.courses);
        setTopics(meta.topics);
        setQuestions(qRes.questions);
        if (meta.courses[0]) {
          setCourseId(meta.courses[0].id);
          const firstTopic = meta.topics.find((t) => t.course_id === meta.courses[0]?.id);
          if (firstTopic) setTopicId(firstTopic.id);
        }
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load admin data."))
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  function openNewForm() {
    setEditingId(null);
    setPromptMd("");
    setPromptImageUrl("");
    setNumericAnswer("");
    setTolerancePct("1");
    setNumericUnit("");
    setSolutionMd("");
    setDifficulty("medium");
    setSource("original");
    setYear("");
    setStatus("draft");
    setIsFree(true);
    setTagsText("");
    setQuestionType("mcq");
    setOptions(EMPTY_OPTIONS.map((o) => ({ ...o })));
    setShowForm(true);
  }

  function openEditForm(q: AdminQuestion) {
    setEditingId(q.id);
    setCourseId(q.course_id);
    setTopicId(q.topic_id);
    setQuestionType(q.question_type);
    setPromptMd(q.prompt_md);
    setPromptImageUrl(q.prompt_image_url ?? "");
    setNumericAnswer(q.numeric_answer != null ? String(q.numeric_answer) : "");
    setTolerancePct(String(q.numeric_tolerance_pct || 1));
    setNumericUnit(q.numeric_unit || "");
    setSolutionMd(q.solution_md);
    setDifficulty(q.difficulty);
    setSource(q.source);
    setYear(q.year != null ? String(q.year) : "");
    setStatus(q.status);
    setIsFree(q.is_free);
    setTagsText(q.tags.join(", "));
    setOptions(
      q.options.length === 4
        ? q.options.map((o) => ({ ...o, image_url: o.image_url || "" }))
        : EMPTY_OPTIONS.map((o) => ({ ...o }))
    );
    setShowForm(true);
  }

  async function handleUpload(file: File, onUrl: (url: string) => void) {
    try {
      const res = await api.admin.uploadImage(file);
      onUrl(res.path);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed.");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        course_id: courseId,
        topic_id: topicId,
        question_type: questionType,
        prompt_md: promptMd,
        prompt_image_url: promptImageUrl,
        numeric_answer: questionType === "numeric" && numericAnswer !== "" ? Number(numericAnswer) : null,
        numeric_tolerance_pct: Number(tolerancePct) || 1,
        numeric_unit: numericUnit,
        solution_md: solutionMd,
        difficulty,
        tags: tagsText
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        source,
        year: year ? Number(year) : null,
        status,
        is_free: isFree,
        options: questionType === "mcq" ? options : [],
      };

      if (editingId) {
        await api.admin.updateQuestion(editingId, payload);
        toast.success("Question updated");
      } else {
        await api.admin.createQuestion(payload);
        toast.success("Question created");
      }
      setShowForm(false);
      await reloadQuestions();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save question.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(q: AdminQuestion) {
    const next: ContentStatus = q.status === "published" ? "draft" : "published";
    try {
      await api.admin.updateStatus(q.id, next);
      toast.success(`Question marked ${next}`);
      await reloadQuestions();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update status.");
    }
  }

  async function handleDelete(q: AdminQuestion) {
    if (!window.confirm("Delete this question permanently?")) return;
    try {
      await api.admin.deleteQuestion(q.id);
      toast.success("Question deleted");
      await reloadQuestions();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not delete question.");
    }
  }

  if (authLoading || loading) {
    return <div className="h-80 animate-pulse rounded-[24px] bg-[var(--bg-surface)]" />;
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-md rounded-[24px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 text-center">
        <ShieldAlert className="mx-auto h-8 w-8 text-[var(--danger)]" />
        <h1 className="mt-3 text-lg font-extrabold">Admin access required</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Only accounts with the <code className="font-mono">admin</code> role can manage questions. Run{" "}
          <code className="font-mono">go run ./cmd/seed-admin</code> to promote your account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge variant="accent">Admin Question Bank</Badge>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight">Manage Questions &amp; SVGs</h1>
        </div>
        <Button type="button" variant="ink" onClick={openNewForm}>
          <Plus className="h-4 w-4" />
          New question
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5">
        <select
          value={filterCourse}
          onChange={(e) => {
            setFilterCourse(e.target.value);
            void reloadQuestions(e.target.value, filterStatus);
          }}
          className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 text-base sm:flex-initial sm:text-sm"
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            void reloadQuestions(filterCourse, e.target.value);
          }}
          className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 text-base sm:flex-initial sm:text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Create / Edit Question Form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-[24px] border border-[var(--accent-border)] bg-[var(--bg-surface)] p-5 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold">
              {editingId ? "Edit Question" : "Create Question"}
            </h2>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold">Course</label>
              <select
                value={courseId}
                onChange={(e) => {
                  const nextCourse = e.target.value;
                  setCourseId(nextCourse);
                  const first = topics.find((t) => t.course_id === nextCourse);
                  if (first) setTopicId(first.id);
                }}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold">Topic</label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3"
              >
                {topicsForCourse.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold">Type</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3"
              >
                <option value="mcq">MCQ (4 options)</option>
                <option value="numeric">Numeric (tolerance)</option>
              </select>
            </div>
          </div>

          {/* Prompt + Live KaTeX preview + Image Upload */}
          <div>
            <label className="block text-xs font-semibold">Question Prompt (supports $KaTeX$)</label>
            <textarea
              required
              rows={3}
              value={promptMd}
              onChange={(e) => setPromptMd(e.target.value)}
              placeholder="Write question prompt with inline $x^2$ or block $$...$$ math"
              className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3"
            />
            {promptMd && (
              <div className="mt-2 rounded-xl bg-[var(--bg-subtle)] p-3 text-xs">
                <span className="mr-2 font-mono font-bold text-[var(--text-muted)]">Preview:</span>
                <MathText text={promptMd} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <input
              type="text"
              value={promptImageUrl}
              onChange={(e) => setPromptImageUrl(e.target.value)}
              placeholder="Optional prompt SVG/image URL (e.g. /diagrams/get-205/...)"
              className="min-h-[44px] w-full min-w-0 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 sm:flex-1"
            />
            <label className="pressable inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-4 text-xs font-semibold cursor-pointer">
              <Upload className="h-3.5 w-3.5" />
              Upload SVG/PNG
              <input
                type="file"
                accept=".svg,.png,.webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUpload(f, setPromptImageUrl);
                }}
              />
            </label>
          </div>

          {/* MCQ Options OR Numeric Answer */}
          {questionType === "mcq" ? (
            <div className="space-y-3">
              <p className="text-xs font-bold">Options (select the single correct answer)</p>
              {options.map((opt, idx) => (
                <div
                  key={opt.label}
                  className="grid gap-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3 sm:grid-cols-12"
                >
                  <label className="flex items-center gap-2 sm:col-span-2 cursor-pointer">
                    <input
                      type="radio"
                      name="correct_option"
                      checked={opt.is_correct}
                      onChange={() =>
                        setOptions((prev) =>
                          prev.map((o, i) => ({ ...o, is_correct: i === idx }))
                        )
                      }
                    />
                    <span className="font-mono text-sm font-bold">{opt.label}</span>
                  </label>
                  <input
                    type="text"
                    value={opt.content_md}
                    onChange={(e) =>
                      setOptions((prev) =>
                        prev.map((o, i) => (i === idx ? { ...o, content_md: e.target.value } : o))
                      )
                    }
                    placeholder="Option text or $KaTeX$"
                    className="min-h-[42px] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 sm:col-span-5"
                  />
                  <input
                    type="text"
                    value={opt.image_url}
                    onChange={(e) =>
                      setOptions((prev) =>
                        prev.map((o, i) => (i === idx ? { ...o, image_url: e.target.value } : o))
                      )
                    }
                    placeholder="Optional SVG URL"
                    className="min-h-[42px] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 sm:col-span-3"
                  />
                  <label className="pressable inline-flex min-h-[42px] items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 text-xs font-semibold sm:col-span-2 cursor-pointer">
                    <Upload className="mr-1 h-3.5 w-3.5" />
                    SVG
                    <input
                      type="file"
                      accept=".svg,.png,.webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          void handleUpload(f, (url) =>
                            setOptions((prev) =>
                              prev.map((o, i) => (i === idx ? { ...o, image_url: url } : o))
                            )
                          );
                        }
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold">Expected number</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={numericAnswer}
                  onChange={(e) => setNumericAnswer(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold">Tolerance (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={tolerancePct}
                  onChange={(e) => setTolerancePct(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold">Unit (optional)</label>
                <input
                  type="text"
                  value={numericUnit}
                  onChange={(e) => setNumericUnit(e.target.value)}
                  placeholder="mm, N, N·m"
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3"
                />
              </div>
            </div>
          )}

          {/* Solution */}
          <div>
            <label className="block text-xs font-semibold">Step-by-step solution (supports $KaTeX$)</label>
            <textarea
              required
              rows={4}
              value={solutionMd}
              onChange={(e) => setSolutionMd(e.target.value)}
              placeholder="**Step 1:** ..."
              className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="min-h-[44px] rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as QuestionSource)}
              className="min-h-[44px] rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3"
            >
              <option value="original">Original</option>
              <option value="past-question">Past question</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ContentStatus)}
              className="min-h-[44px] rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <input
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="tags, comma, separated"
              className="min-h-[44px] rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
            />
            Free tier accessible (`is_free = true`)
          </label>

          <div className="flex justify-end gap-2">
            <Button type="submit" variant="accent" size="lg" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Create question"}
            </Button>
          </div>
        </form>
      )}

      {/* Question Bank List */}
      <div className="space-y-3">
        {questions.map((q) => (
          <article
            key={q.id}
            className="rounded-[20px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent" className="font-mono">
                  {q.course_code}
                </Badge>
                <Badge variant="neutral">{q.topic_title}</Badge>
                <Badge variant="neutral" className="font-mono uppercase">
                  {q.question_type}
                </Badge>
                <Badge variant={q.status === "published" ? "success" : "draft"}>
                  {q.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Button type="button" variant="secondary" size="sm" onClick={() => togglePublish(q)}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {q.status === "published" ? "Unpublish" : "Publish"}
                </Button>
                <Button type="button" variant="subtle" size="sm" onClick={() => openEditForm(q)}>
                  <Eye className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Delete question"
                  onClick={() => handleDelete(q)}
                >
                  <Trash2 className="h-4 w-4 text-[var(--danger)]" />
                </Button>
              </div>
            </div>

            <div className="math-scroll-x mt-3 text-sm text-[var(--text-primary)]">
              <MathText text={q.prompt_md} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

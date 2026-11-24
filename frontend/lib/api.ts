import type {
  AdminOption,
  AdminQuestion,
  AdminTopicMeta,
  AttemptFeedback,
  ContentStatus,
  Course,
  DashboardPayload,
  LibraryPayload,
  Difficulty,
  GradedQuestionReview,
  MockExam,
  MockExamSummary,
  PublicQuestion,
  QuestionSource,
  QuestionType,
  Topic,
  TopicBreakdownItem,
  User,
} from "./types";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

interface ErrorBody {
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string>;
  };
}

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

async function request<T>(path: string, init: RequestInit = {}, allowRefresh = true): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...headers,
      ...(init.headers as Record<string, string> | undefined),
    },
  });

  // Retry once after a silent refresh. /auth/me is included so an expired 15-minute access
  // token doesn't look like a logout; login/register/logout pass allowRefresh=false themselves.
  if (response.status === 401 && allowRefresh && path !== "/api/v1/auth/refresh") {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return request<T>(path, init, false);
    }
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? ((await response.json()) as unknown) : null;

  // The Go API always answers with JSON. A non-JSON 5xx or 404 means the Next.js
  // /api/v1 proxy is not wired to a running API yet (missing or unreachable API_INTERNAL_URL).
  if (!response.ok && !isJson && (response.status >= 500 || response.status === 404)) {
    throw new ApiError(
      response.status,
      "API_UNREACHABLE",
      "Can't reach the GET Hub server right now. Please try again in a moment."
    );
  }

  if (!response.ok) {
    const errObj = (body as ErrorBody | null)?.error;
    throw new ApiError(
      response.status,
      errObj?.code || "API_ERROR",
      errObj?.message || `Request failed (${response.status})`,
      errObj?.fields
    );
  }

  return body as T;
}

export const api = {
  googleAuthStartUrl(): string {
    return `${API_BASE}/api/v1/auth/google/start`;
  },

  library() {
    return request<LibraryPayload>("/api/v1/library");
  },

  libraryDownloadLink(materialId: string) {
    return request<{ url: string; file_name: string; expires_at: string }>(
      `/api/v1/library/${encodeURIComponent(materialId)}/download`
    );
  },

  authProviders() {
    return request<{ google_enabled: boolean }>("/api/v1/auth/providers", {}, false);
  },

  register(input: {
    full_name: string;
    email: string;
    password: string;
    department: string;
    level: string;
  }) {
    return request<{ user: User }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }, false);
  },

  login(input: { email: string; password: string }) {
    return request<{ user: User }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }, false);
  },

  logout() {
    return request<{ ok: boolean }>("/api/v1/auth/logout", { method: "POST" }, false);
  },

  me() {
    return request<{ user: User; google_oauth_enabled: boolean }>("/api/v1/auth/me");
  },

  dashboard() {
    return request<DashboardPayload>("/api/v1/dashboard");
  },

  listCourses() {
    return request<{ courses: Course[] }>("/api/v1/courses");
  },

  getCourse(slug: string) {
    return request<{ course: Course; topics: Topic[] }>(`/api/v1/courses/${encodeURIComponent(slug)}`);
  },

  markTopicViewed(topicId: string) {
    return request<{ progress: unknown }>(`/api/v1/topics/${topicId}/view`, { method: "POST" });
  },

  setTopicCompleted(topicId: string, completed: boolean) {
    return request<{ progress: unknown }>(`/api/v1/topics/${topicId}/complete`, {
      method: "POST",
      body: JSON.stringify({ completed }),
    });
  },

  listTopicQuestions(topicId: string) {
    return request<{ topic: Topic; course: Course; questions: PublicQuestion[] }>(
      `/api/v1/topics/${topicId}/questions`
    );
  },

  submitAttempt(
    questionId: string,
    payload: {
      selected_option_id?: string;
      numeric_input?: number;
      time_taken_ms: number;
    }
  ) {
    return request<AttemptFeedback>(`/api/v1/questions/${questionId}/attempt`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  startMockExam(courseSlug: string, opts?: { question_count?: number; duration_seconds?: number }) {
    return request<{ exam: MockExam; course: Course; questions: PublicQuestion[] }>(
      `/api/v1/courses/${encodeURIComponent(courseSlug)}/mock-exams`,
      {
        method: "POST",
        body: JSON.stringify(opts || {}),
      }
    );
  },

  listMyMockExams() {
    return request<{ exams: MockExamSummary[] }>("/api/v1/mock-exams");
  },

  getMockExam(examId: string) {
    return request<{
      exam: MockExam;
      course: Course;
      questions?: PublicQuestion[];
      remaining_seconds?: number;
      reviews?: GradedQuestionReview[];
      topic_breakdown?: TopicBreakdownItem[];
    }>(`/api/v1/mock-exams/${examId}`);
  },

  submitMockExam(
    examId: string,
    answers: Array<{
      question_id: string;
      selected_option_id?: string;
      numeric_input?: number;
    }>
  ) {
    return request<{
      exam: MockExam;
      course: Course;
      reviews: GradedQuestionReview[];
      topic_breakdown: TopicBreakdownItem[];
    }>(`/api/v1/mock-exams/${examId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  },

  admin: {
    metadata() {
      return request<{ courses: Course[]; topics: AdminTopicMeta[] }>("/api/v1/admin/metadata");
    },

    listQuestions(params?: { course_id?: string; topic_id?: string; status?: string }) {
      const sp = new URLSearchParams();
      if (params?.course_id) sp.set("course_id", params.course_id);
      if (params?.topic_id) sp.set("topic_id", params.topic_id);
      if (params?.status) sp.set("status", params.status);
      const qs = sp.toString();
      return request<{ questions: AdminQuestion[] }>(`/api/v1/admin/questions${qs ? `?${qs}` : ""}`);
    },

    createQuestion(payload: {
      course_id: string;
      topic_id: string;
      question_type: QuestionType;
      prompt_md: string;
      prompt_image_url: string;
      numeric_answer: number | null;
      numeric_tolerance_pct: number;
      numeric_unit: string;
      solution_md: string;
      difficulty: Difficulty;
      tags: string[];
      source: QuestionSource;
      year: number | null;
      status: ContentStatus;
      is_free: boolean;
      options: AdminOption[];
    }) {
      return request<{ question: AdminQuestion }>("/api/v1/admin/questions", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    updateQuestion(
      questionId: string,
      payload: {
        course_id: string;
        topic_id: string;
        question_type: QuestionType;
        prompt_md: string;
        prompt_image_url: string;
        numeric_answer: number | null;
        numeric_tolerance_pct: number;
        numeric_unit: string;
        solution_md: string;
        difficulty: Difficulty;
        tags: string[];
        source: QuestionSource;
        year: number | null;
        status: ContentStatus;
        is_free: boolean;
        options: AdminOption[];
      }
    ) {
      return request<{ question: AdminQuestion }>(`/api/v1/admin/questions/${questionId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },

    updateStatus(questionId: string, status: ContentStatus) {
      return request<{ question: AdminQuestion }>(`/api/v1/admin/questions/${questionId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },

    deleteQuestion(questionId: string) {
      return request<{ ok: boolean }>(`/api/v1/admin/questions/${questionId}`, {
        method: "DELETE",
      });
    },

    uploadImage(file: File) {
      const fd = new FormData();
      fd.append("file", file);
      return request<{ url: string; path: string }>("/api/v1/admin/uploads", {
        method: "POST",
        body: fd,
      });
    },
  },
};

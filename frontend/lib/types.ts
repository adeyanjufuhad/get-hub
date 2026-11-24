export type UserRole = "student" | "admin";
export type ContentStatus = "draft" | "published";
export type QuestionType = "mcq" | "numeric";
export type Difficulty = "easy" | "medium" | "hard";
export type QuestionSource = "original" | "past-question";

export interface User {
  id: string;
  email: string;
  full_name: string;
  department: string;
  level: string;
  role: UserRole;
  avatar_color: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  code: string;
  slug: string;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
  total_topics?: number;
  completed_topics?: number;
}

export interface Topic {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  display_order: number;
  ccmas_ref: string;
  outcomes: string[];
  status: ContentStatus;
  is_free: boolean;
  completed?: boolean;
  can_access?: boolean;
  question_count?: number;
}

export interface PublicOption {
  id: string;
  label: "A" | "B" | "C" | "D";
  content_md: string;
  image_url?: string;
  display_order: number;
}

export interface PublicQuestion {
  id: string;
  course_id: string;
  topic_id: string;
  question_type: QuestionType;
  prompt_md: string;
  prompt_image_url?: string;
  numeric_tolerance_pct?: number;
  numeric_unit?: string;
  difficulty: Difficulty;
  tags: string[];
  source: QuestionSource;
  year?: number;
  status: ContentStatus;
  is_free: boolean;
  options?: PublicOption[];
}

export interface AttemptFeedback {
  attempt_id: string;
  is_correct: boolean;
  correct_option_id?: string | null;
  numeric_answer?: number | null;
  numeric_tolerance_pct: number;
  numeric_unit: string;
  solution_md: string;
}

export interface MockExam {
  id: string;
  user_id: string;
  course_id: string;
  question_ids: string[];
  duration_seconds: number;
  started_at: string;
  submitted_at?: string | null;
  score?: number | null;
  total_questions: number;
  created_at: string;
}

export interface MockExamSummary extends MockExam {
  course_code: string;
  course_slug: string;
  course_title: string;
}

export interface TopicBreakdownItem {
  topic_id: string;
  topic_title: string;
  topic_slug: string;
  correct: number;
  total: number;
  accuracy_pct: number;
}

export interface GradedQuestionReview {
  question: PublicQuestion;
  selected_option_id?: string;
  numeric_input?: number;
  is_correct: boolean;
  correct_option_id?: string;
  numeric_answer?: number;
  numeric_tolerance_pct?: number;
  solution_md: string;
}

export interface LastViewedTopic {
  topic_id: string;
  last_viewed_at: string;
  completed_at?: string | null;
  topic_slug: string;
  topic_title: string;
  course_code: string;
  course_slug: string;
  course_title: string;
}

export interface TopicAccuracy {
  topic_id: string;
  topic_slug: string;
  topic_title: string;
  course_id: string;
  course_code: string;
  course_slug: string;
  attempts_count: number;
  correct_count: number;
  unique_questions_attempted: number;
  accuracy_pct: number;
  completed: boolean;
}

export interface DashboardPayload {
  user: User;
  streak_days: number;
  continue_topic: LastViewedTopic | null;
  summary: {
    total_topics: number;
    completed_topics: number;
    total_attempts: number;
    overall_accuracy: number;
  };
  courses: Course[];
  topic_stats: TopicAccuracy[];
  weak_topics: TopicAccuracy[];
  recent_exams: MockExamSummary[];
}

export interface AdminOption {
  id?: string;
  label: "A" | "B" | "C" | "D";
  content_md: string;
  image_url: string;
  is_correct: boolean;
}

export interface AdminQuestion {
  id: string;
  course_id: string;
  topic_id: string;
  course_code: string;
  course_slug: string;
  topic_title: string;
  topic_slug: string;
  question_type: QuestionType;
  prompt_md: string;
  prompt_image_url: string | null;
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
  created_at: string;
}

export interface AdminTopicMeta {
  id: string;
  course_id: string;
  course_code: string;
  course_slug: string;
  slug: string;
  title: string;
  display_order: number;
  status: ContentStatus;
  is_free: boolean;
}

export type LibraryMaterialKind =
  | "lecture_notes"
  | "past_questions"
  | "tutorial"
  | "handout"
  | "student_notes"
  | "lab_manual";

export interface LibraryCourse {
  code: string;
  title: string;
  semester: 1 | 2;
  material_count: number;
}

export interface LibraryMaterial {
  id: string;
  course_code: string;
  title: string;
  kind: LibraryMaterialKind;
  credit: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  download_count: number;
  created_at: string;
}

export interface LibraryPayload {
  courses: LibraryCourse[];
  materials: LibraryMaterial[];
  downloads_enabled: boolean;
}

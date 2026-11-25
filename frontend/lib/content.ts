import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { ContentStatus } from "./types";

export interface TopicFrontmatter {
  title: string;
  order: number;
  topicId: string;
  courseCode: string;
  courseSlug: string;
  ccmasRef: string;
  textbookRef?: string;
  outcomes: string[];
  status: ContentStatus;
  isFree: boolean;
}

export interface TopicDocument {
  slug: string;
  frontmatter: TopicFrontmatter;
  content: string;
}

export interface CourseContentManifest {
  code: string;
  slug: string;
  title: string;
  description: string;
  topics: Array<{
    slug: string;
    topicId: string;
    title: string;
    order: number;
    ccmasRef: string;
    status: ContentStatus;
    isFree: boolean;
  }>;
}

function resolveContentRoot(): string {
  const candidates = [
    path.resolve(process.cwd(), "..", "content"),
    path.resolve(process.cwd(), "content"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  return candidates[0] as string;
}

export function getCourseManifest(courseSlug: string): CourseContentManifest | null {
  const filePath = path.join(resolveContentRoot(), "courses", courseSlug, "course.json");
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as CourseContentManifest;
}

export function listAllTopicParams(): Array<{ slug: string; topicSlug: string }> {
  const coursesDir = path.join(resolveContentRoot(), "courses");
  if (!fs.existsSync(coursesDir)) return [];

  const params: Array<{ slug: string; topicSlug: string }> = [];
  for (const entry of fs.readdirSync(coursesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const manifest = getCourseManifest(entry.name);
    if (!manifest) continue;
    for (const topic of manifest.topics) {
      params.push({ slug: manifest.slug, topicSlug: topic.slug });
    }
  }
  return params;
}

export function getTopicDocument(courseSlug: string, topicSlug: string): TopicDocument | null {
  const filePath = path.join(resolveContentRoot(), "courses", courseSlug, "topics", `${topicSlug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(raw);
  const data = parsed.data as Partial<TopicFrontmatter>;

  return {
    slug: topicSlug,
    frontmatter: {
      title: data.title ?? topicSlug,
      order: data.order ?? 1,
      topicId: data.topicId ?? "",
      courseCode: data.courseCode ?? courseSlug.toUpperCase(),
      courseSlug: data.courseSlug ?? courseSlug,
      ccmasRef: data.ccmasRef ?? "",
      textbookRef: data.textbookRef,
      outcomes: Array.isArray(data.outcomes) ? data.outcomes : [],
      status: data.status === "published" ? "published" : "draft",
      isFree: data.isFree ?? true,
    },
    content: parsed.content,
  };
}

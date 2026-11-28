import coursesManifest from "../../content/courses.json";
import get207Manifest from "../../content/courses/get-207/course.json";
import get209Manifest from "../../content/courses/get-209/course.json";
import drillsManifest from "../../content/textbooks.json";

// Change the platform name in this single constant (and content/courses.json) to rename the site.
export const APP_NAME = coursesManifest.appName;
export const APP_TAGLINE = "Built for OAU 200L Engineering. Clear notes, real practice, zero fluff.";
export const APP_SEMESTER = coursesManifest.semester;
export const APP_INSTITUTION = coursesManifest.institution;

export interface CourseConfig {
  readonly code: string;
  readonly slug: string;
  readonly title: string;
  readonly shortTitle: string;
  readonly description: string;
  readonly units: number;
  readonly order: number;
  readonly badgeColor: string;
  readonly hasDiagrams: boolean;
}

export const COURSES: readonly CourseConfig[] = coursesManifest.courses;

// OAU departments by faculty. Each department belongs to exactly one faculty, so the
// faculty is derived from the department rather than stored on the user.
// Keep in sync with FacultyDepartments in backend/internal/http/validate.go.
export const OAU_FACULTIES = [
  {
    name: "Faculty of Technology",
    departments: [
      "Agricultural and Environmental Engineering",
      "Chemical Engineering",
      "Civil Engineering",
      "Computer Engineering",
      "Electronic and Electrical Engineering",
      "Food Science and Technology",
      "Materials Science and Engineering",
      "Mechanical Engineering",
    ],
  },
] as const;

export type OauFaculty = (typeof OAU_FACULTIES)[number]["name"];

export const OAU_DEPARTMENTS: readonly string[] = OAU_FACULTIES.flatMap((f) => f.departments);

export const DEFAULT_DEPARTMENT = "Computer Engineering";

/** The faculty a department belongs to (falls back to the first faculty for unknown values). */
export function facultyOf(department: string): OauFaculty {
  const match = OAU_FACULTIES.find((f) => (f.departments as readonly string[]).includes(department));
  return (match ?? OAU_FACULTIES[0]).name;
}

// Older accounts may still carry a department name that no longer exists at OAU.
const LEGACY_DEPARTMENTS: Record<string, string> = {
  "Computer Science and Engineering": "Computer Engineering",
};

/** Maps legacy department names to their current one. */
export function normalizeDepartment(department: string): string {
  return LEGACY_DEPARTMENTS[department] ?? department;
}

export const DEFAULT_STUDY_LEVEL = "200L" as const;

export const CCMAS_OUTLINE: Record<string, readonly string[]> = {
  "get-205": [
    "Fluid properties: density, viscosity & surface tension",
    "Hydrostatic pressure, Pascal's law & manometry",
    "Hydrostatic forces on submerged plane & curved surfaces",
    "Buoyancy, Archimedes' principle & stability of floating bodies",
    "Control-volume continuity & momentum equations",
    "Bernoulli's equation, Venturi meters & Pitot tubes",
    "Pipe head losses & Buckingham Pi dimensional analysis",
  ],
  "get-207": [
    "Forces, moments, couples & 2D equilibrium",
    "Equilibrium of structures & machine parts",
    "Friction on inclined planes & wedges",
    "Centroids, first & second moments of area",
    "Kinematics of particles & rigid bodies",
    "Newton's laws of motion",
    "Kinetic energy & momentum analysis",
  ],
  "get-209": [
    "Limits & continuity of functions",
    "Differentiation & composite functions",
    "Linear first-order differential equations",
    "Partial & total derivatives",
    "Matrices & determinants",
    "Vector algebra & vector calculus",
    "Directional derivatives & gradients",
  ],
};

export interface PracticeHighlightConfig {
  readonly id: string;
  readonly courseCode: string;
  readonly courseSlug: string;
  readonly topicId: string;
  readonly topicLabel: string;
  readonly difficulty: string;
  readonly title: string;
  readonly preview: string;
  readonly figureImage?: string;
}

export const COURSE_BANNER_IMAGES: Record<string, string> = {
  "get-205": "/images/courses/get-205.webp",
  "get-207": "/images/courses/get-207.webp",
  "get-209": "/images/courses/get-209.webp",
};

export interface FallbackTopicMeta {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly display_order: number;
  readonly ccmas_ref: string;
  readonly question_count: number;
  /** Course section a topic belongs to, e.g. "Statics" / "Dynamics" (GET 207). */
  readonly part?: string;
}

const STATIC_TOPICS_FALLBACK: Record<string, readonly FallbackTopicMeta[]> = {
  "get-205": [
    {
      id: "22222222-2222-4222-8222-222222220205",
      slug: "fluid-properties-and-hydrostatics",
      title: "Fluid Properties, Hydrostatic Pressure & Manometry",
      display_order: 1,
      ccmas_ref: "Fluid properties; hydrostatics, pressure measurement & forces on submerged surfaces",
      question_count: 10,
    },
    {
      id: "22222222-2222-4222-8222-222222250002",
      slug: "buoyancy-and-stability",
      title: "Buoyancy, Archimedes' Principle & Stability of Floating Bodies",
      display_order: 2,
      ccmas_ref: "Buoyancy, Archimedes' principle & stability of floating and submerged bodies",
      question_count: 7,
    },
    {
      id: "22222222-2222-4222-8222-222222250003",
      slug: "continuity-and-bernoulli",
      title: "Continuity, Bernoulli's Equation & Flow Measurement",
      display_order: 3,
      ccmas_ref: "Control-volume continuity; Bernoulli's equation, Venturi meters & Pitot tubes",
      question_count: 7,
    },
  ],
};

interface CourseManifestJson {
  readonly topics: ReadonlyArray<{
    readonly slug: string;
    readonly topicId: string;
    readonly title: string;
    readonly order: number;
    readonly ccmasRef: string;
    readonly part?: string;
  }>;
}

function topicsFromManifest(manifest: CourseManifestJson): readonly FallbackTopicMeta[] {
  return manifest.topics.map((t) => ({
    id: t.topicId,
    slug: t.slug,
    title: t.title,
    display_order: t.order,
    ccmas_ref: t.ccmasRef,
    question_count: 0,
    part: t.part,
  }));
}

export const COURSE_TOPICS_FALLBACK: Record<string, readonly FallbackTopicMeta[]> = {
  ...STATIC_TOPICS_FALLBACK,
  "get-207": topicsFromManifest(get207Manifest),
  "get-209": topicsFromManifest(get209Manifest),
};

export const PRACTICE_HIGHLIGHTS: readonly PracticeHighlightConfig[] = drillsManifest.drills;

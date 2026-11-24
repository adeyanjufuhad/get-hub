import coursesManifest from "../../content/courses.json";
import textbooksManifest from "../../content/textbooks.json";

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

export const OAU_DEPARTMENTS = [
  "Computer Engineering",
  "Electronic and Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Agricultural and Environmental Engineering",
  "Materials Science and Engineering",
  "Food Science and Technology",
] as const;

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

export interface TextbookConfig {
  readonly id: string;
  readonly courseCode: string;
  readonly courseSlug: string;
  readonly title: string;
  readonly authors: string;
  readonly edition: string;
  readonly role: string;
  readonly coverImage: string;
  readonly bestFor: string;
  readonly chapters: readonly string[];
  readonly readUrl: string;
}

export interface TextbookDrillConfig {
  readonly id: string;
  readonly courseCode: string;
  readonly courseSlug: string;
  readonly topicId: string;
  readonly textbookRef: string;
  readonly difficulty: string;
  readonly title: string;
  readonly preview: string;
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
}

export const COURSE_TOPICS_FALLBACK: Record<string, readonly FallbackTopicMeta[]> = {
  "get-205": [
    {
      id: "22222222-2222-4222-8222-222222220205",
      slug: "fluid-properties-and-hydrostatics",
      title: "Fluid Properties, Hydrostatic Pressure & Manometry",
      display_order: 1,
      ccmas_ref: "Fluid properties; hydrostatics, pressure measurement & forces on submerged surfaces",
      question_count: 8,
    },
    {
      id: "22222222-2222-4222-8222-222222250002",
      slug: "buoyancy-and-stability",
      title: "Buoyancy, Archimedes' Principle & Stability of Floating Bodies",
      display_order: 2,
      ccmas_ref: "Buoyancy, Archimedes' principle & stability of floating and submerged bodies",
      question_count: 5,
    },
    {
      id: "22222222-2222-4222-8222-222222250003",
      slug: "continuity-and-bernoulli",
      title: "Continuity, Bernoulli's Equation & Flow Measurement",
      display_order: 3,
      ccmas_ref: "Control-volume continuity; Bernoulli's equation, Venturi meters & Pitot tubes",
      question_count: 5,
    },
  ],
  "get-207": [
    {
      id: "22222222-2222-4222-8222-222222220207",
      slug: "forces-moments-and-equilibrium",
      title: "Forces, Moments, Couples & 2D Equilibrium",
      display_order: 1,
      ccmas_ref: "Forces, moments, couples; equilibrium of simple structures and machine parts",
      question_count: 8,
    },
    {
      id: "22222222-2222-4222-8222-222222270002",
      slug: "dry-friction-and-inclines",
      title: "Dry Friction on Inclined Planes, Ladders & Wedges",
      display_order: 2,
      ccmas_ref: "Friction on inclined planes, ladders & wedges",
      question_count: 5,
    },
    {
      id: "22222222-2222-4222-8222-222222270003",
      slug: "centroids-and-second-moments",
      title: "Centroids, First & Second Moments of Area",
      display_order: 3,
      ccmas_ref: "Centroids, first & second moments of area",
      question_count: 5,
    },
  ],
  "get-209": [
    {
      id: "22222222-2222-4222-8222-222222220209",
      slug: "limits-and-continuity",
      title: "Limits and Continuity of Functions",
      display_order: 1,
      ccmas_ref: "Limits; continuity",
      question_count: 8,
    },
    {
      id: "22222222-2222-4222-8222-222222290002",
      slug: "first-order-linear-odes",
      title: "First-Order Linear Differential Equations",
      display_order: 2,
      ccmas_ref: "Linear first-order differential equations",
      question_count: 5,
    },
    {
      id: "22222222-2222-4222-8222-222222290003",
      slug: "partial-derivatives-and-matrices",
      title: "Partial Derivatives, Gradients & Matrices",
      display_order: 3,
      ccmas_ref: "Partial & total derivatives; directional derivatives & gradients; matrices & determinants",
      question_count: 5,
    },
  ],
};

export const TEXTBOOKS: readonly TextbookConfig[] = textbooksManifest.textbooks;
export const TEXTBOOK_DRILLS: readonly TextbookDrillConfig[] = textbooksManifest.drills;

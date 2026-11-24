import coursesManifest from "../../content/courses.json";

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
  "Computer Science and Engineering",
  "Electronic and Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Agricultural and Environmental Engineering",
  "Materials Science and Engineering",
  "Food Science and Technology",
] as const;

export const STUDY_LEVELS = ["100L", "200L", "300L", "400L", "500L"] as const;

export const CCMAS_OUTLINE: Record<string, readonly string[]> = {
  "get-203": [
    "Projection of lines & auxiliary views",
    "Working (production) & semi-detailed drawings",
    "Solid, surface & shell modelling",
    "Surface intersections & component-based design",
    "Assembly & motion constraints",
    "Electronics PCB layout & schematics",
    "Parametric design, DFM, 3D printing & CNC",
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

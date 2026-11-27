// Validates every topic MDX file and question bank under ../content/courses.
//   node scripts/validate-content.mjs            → all courses
//   node scripts/validate-content.mjs get-209    → one course
// Checks: MDX compiles with remark-math + rehype-katex, only known components
// are used, every course.json topic has an MDX file, referenced /diagrams files
// exist, and questions/*.json match the bank schema in content/AUTHORING.md.
import fs from "node:fs";
import path from "node:path";
import { compile } from "@mdx-js/mdx";
import matter from "gray-matter";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

const KNOWN_COMPONENTS = new Set([
  "DiagramFigure",
  "StepRevealExample",
  "Callout",
  "RuleBox",
  "ExerciseSet",
  "SectionRef",
]);

const contentDir = path.resolve(process.cwd(), "..", "content", "courses");
const only = process.argv[2];
let errors = 0;
let warnings = 0;

function fail(file, msg) {
  errors++;
  console.error(`✗ ${path.relative(contentDir, file)}: ${msg}`);
}
function warn(file, msg) {
  warnings++;
  console.warn(`! ${path.relative(contentDir, file)}: ${msg}`);
}

function checkDiagramRefs(file, text, courseSlug) {
  const refs = text.match(/\/diagrams\/[a-z0-9-]+\/[A-Za-z0-9._-]+\.(svg|png|webp)/g) ?? [];
  for (const ref of new Set(refs)) {
    const [, , slug, name] = ref.split("/");
    const onDisk = path.join(contentDir, slug, "diagrams", name);
    if (!fs.existsSync(onDisk)) fail(file, `missing diagram ${ref} (expected ${path.relative(contentDir, onDisk)})`);
    if (slug !== courseSlug) warn(file, `diagram ${ref} belongs to another course`);
  }
  const pub = text.match(/\/images\/[A-Za-z0-9/._-]+/g) ?? [];
  for (const ref of new Set(pub)) {
    const onDisk = path.resolve(process.cwd(), "public", "." + ref);
    if (!fs.existsSync(onDisk)) fail(file, `missing public image ${ref}`);
  }
}

async function checkMdx(file, courseSlug) {
  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  for (const key of ["title", "order", "topicId", "courseCode", "courseSlug", "outcomes", "status"]) {
    if (data[key] === undefined) fail(file, `frontmatter missing "${key}"`);
  }
  try {
    await compile(content, {
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
      development: false,
    });
  } catch (err) {
    const where = err.place?.line ? ` (line ${err.place.line + Object.keys(data).length + 2}ish)` : "";
    fail(file, `MDX compile error${where}: ${err.reason ?? err.message}`);
  }
  const tags = content.match(/<([A-Z][A-Za-z0-9]*)/g) ?? [];
  for (const t of new Set(tags.map((x) => x.slice(1)))) {
    if (!KNOWN_COMPONENTS.has(t)) fail(file, `unknown component <${t}>`);
  }
  checkDiagramRefs(file, content, courseSlug);
  const words = content.split(/\s+/).filter(Boolean).length;
  return words;
}

function checkBank(file, courseSlug, topicSlugs) {
  let bank;
  try {
    bank = JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch (err) {
    fail(file, `invalid JSON: ${err.message}`);
    return 0;
  }
  if (!topicSlugs.has(bank.topicSlug)) fail(file, `topicSlug "${bank.topicSlug}" is not in course.json`);
  if (!Array.isArray(bank.questions) || bank.questions.length === 0) {
    fail(file, "questions must be a non-empty array");
    return 0;
  }
  const keys = new Set();
  for (const [i, q] of bank.questions.entries()) {
    const at = `questions[${i}]${q.key ? ` (${q.key})` : ""}`;
    if (!q.key || !/^[a-z0-9-]+$/.test(q.key)) fail(file, `${at}: key must be kebab-case`);
    if (keys.has(q.key)) fail(file, `${at}: duplicate key`);
    keys.add(q.key);
    if (!q.prompt) fail(file, `${at}: prompt required`);
    if (!q.solution) fail(file, `${at}: solution required`);
    if (!q.source) fail(file, `${at}: source (book reference) required`);
    if (!["easy", "medium", "hard"].includes(q.difficulty)) fail(file, `${at}: difficulty must be easy|medium|hard`);
    if (q.type === "numeric") {
      if (typeof q.answer !== "number" || !Number.isFinite(q.answer)) fail(file, `${at}: numeric answer must be a number`);
      if (q.options) fail(file, `${at}: numeric questions take no options`);
    } else if (q.type === "mcq") {
      if (!Array.isArray(q.options) || q.options.length !== 4) fail(file, `${at}: mcq needs exactly 4 options`);
      else {
        const labels = q.options.map((o) => o.label).join("");
        if (labels !== "ABCD") fail(file, `${at}: option labels must be A,B,C,D in order`);
        if (q.options.filter((o) => o.correct).length !== 1) fail(file, `${at}: exactly one option must be correct`);
      }
    } else fail(file, `${at}: type must be mcq|numeric`);
    checkDiagramRefs(file, JSON.stringify(q), courseSlug);
  }
  return bank.questions.length;
}

for (const courseSlug of fs.readdirSync(contentDir)) {
  if (only && courseSlug !== only) continue;
  const courseDir = path.join(contentDir, courseSlug);
  const manifestPath = path.join(courseDir, "course.json");
  if (!fs.existsSync(manifestPath)) continue;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const topicSlugs = new Set(manifest.topics.map((t) => t.slug));
  console.log(`\n${manifest.code}`);
  for (const topic of manifest.topics) {
    const mdx = path.join(courseDir, "topics", `${topic.slug}.mdx`);
    if (!fs.existsSync(mdx)) {
      fail(mdx, "topic listed in course.json but MDX file missing");
      continue;
    }
    const words = await checkMdx(mdx, courseSlug);
    const bankPath = path.join(courseDir, "questions", `${topic.slug}.json`);
    const nq = fs.existsSync(bankPath) ? checkBank(bankPath, courseSlug, topicSlugs) : 0;
    console.log(`  ${String(topic.order).padStart(2)}. ${topic.slug} — ${words} words, ${nq} bank questions`);
  }
}

console.log(`\n${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);

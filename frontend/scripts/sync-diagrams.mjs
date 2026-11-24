import fs from "node:fs";
import path from "node:path";

const contentCoursesDir = path.resolve(process.cwd(), "..", "content", "courses");
const publicDiagramsDir = path.resolve(process.cwd(), "public", "diagrams");

if (!fs.existsSync(contentCoursesDir)) {
  console.warn("No ../content/courses directory found, skipping diagram sync.");
  process.exit(0);
}

fs.mkdirSync(publicDiagramsDir, { recursive: true });

for (const courseSlug of fs.readdirSync(contentCoursesDir)) {
  const srcDir = path.join(contentCoursesDir, courseSlug, "diagrams");
  if (!fs.existsSync(srcDir) || !fs.statSync(srcDir).isDirectory()) continue;
  const dstDir = path.join(publicDiagramsDir, courseSlug);
  fs.mkdirSync(dstDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    if (!file.endsWith(".svg") && !file.endsWith(".png") && !file.endsWith(".webp")) continue;
    fs.copyFileSync(path.join(srcDir, file), path.join(dstDir, file));
  }
}

console.log("Synced SVG diagrams from /content/courses/*/diagrams to /frontend/public/diagrams");

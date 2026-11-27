"use client";

import katex from "katex";
import { Fragment, useMemo } from "react";
import { cn } from "@/lib/cn";

interface Segment {
  kind: "text" | "bold" | "code" | "inline-math" | "display-math" | "newline";
  value: string;
}

/**
 * Strips any legacy textbook citations or author/section callouts that may
 * still exist in persisted question banks so students only see clean,
 * self-contained engineering problems and solutions.
 */
export function sanitizeStudyText(input: string): string {
  return input
    // Leading bold textbook headers like "**[Çengel · Ch. 2, Prob. 2–47]** "
    .replace(/^\*\*\[(?:Çengel|Cengel|Hibbeler|Stewart|Beer|Johnston|Dass|H\.\s*K\.\s*Dass)[^\]]*\]\*\*\s*/i, "")
    // Parenthetical textbook print/rounding notes
    .replace(/\s*\((?:Çengel|Cengel|Hibbeler|Stewart|Beer(?:\s*&\s*Johnston)?|H\.\s*K\.\s*Dass|Dass)[^)]*\)/gi, "")
    // Inline author/section attributions
    .replace(/\baccording to H\.\s*K\.\s*Dass\s*\([^)]*\)/gi, "using the standard definition")
    .replace(/\baccording to (?:H\.\s*K\.\s*Dass|Dass|Beer\s*&\s*Johnston|Hibbeler|Çengel|Cengel|Stewart)\b/gi, "using the standard method")
    .replace(/\bApplying Dass['’]s sequential evaluation\b/gi, "Evaluating sequentially")
    .replace(/\b(?:in|from) the lower panel of Stewart Figure \d+\b/gi, "in the lower panel of the figure")
    .replace(/\bStewart Figure \d+\b/gi, "the figure")
    .replace(/\b(?:By|From|Using|See|Per)\s+(?:Rule\s+[IVX]+\s*)?\(?(?:§\s*\d+(?:\.\d+)*|Ch\.\s*\d+[^,.)]*)\)?,?\s*/gi, "")
    .replace(/\s*\(§\s*\d+(?:\.\d+)*[^)]*\)/g, "")
    .replace(/ {2,}/g, " ")
    .trimStart();
}

/**
 * Normalizes accidentally double-escaped LaTeX inside a math expression
 * (e.g. `\\dfrac`, `\\begin{bmatrix} ... \\\\ ... \\end{bmatrix}`) while
 * preserving legitimate matrix/cases row breaks (`\\`).
 */
function normalizeLatex(tex: string): string {
  const looksDoubleEscaped =
    /\\\\(?:d?frac|lim|begin|end|partial|left|right|text|vec|hat|mathbf|mathrm|operatorname|sqrt|sin|cos|tan|sec|csc|cot|log|ln|to|implies|iff|cdot|times|circ|displaystyle|substack|nabla|sum|int|infty|alpha|beta|gamma|delta|varepsilon|epsilon|theta|phi|lambda|mu|rho|pi|omega|Delta|Omega|pm|le|ge|neq|ne|approx|bar|overline|quad|qquad)\b/.test(
      tex
    );
  if (!looksDoubleEscaped) return tex;
  return tex
    .replace(/\\\\\\\\/g, "__ROWBREAK__")
    .replace(/\\\\([a-zA-Z{},;:!|])/g, "\\$1")
    .replace(/__ROWBREAK__/g, "\\\\");
}

function tokenizeInline(input: string, allowBold = true): Segment[] {
  const segments: Segment[] = [];
  const regex = allowBold
    ? /(\$\$[\s\S]+?\$\$|\$(?!\$)[^$\n]+?\$|\*\*[^*\n]+?\*\*|`[^`\n]+`|\n)/g
    : /(\$\$[\s\S]+?\$\$|\$(?!\$)[^$\n]+?\$|`[^`\n]+`|\n)/g;
  let lastIndex = 0;

  for (const match of input.matchAll(regex)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      segments.push({ kind: "text", value: input.slice(lastIndex, idx) });
    }
    const token = match[0];
    if (token === "\n") {
      segments.push({ kind: "newline", value: "\n" });
    } else if (token.startsWith("$$") && token.endsWith("$$")) {
      segments.push({ kind: "display-math", value: normalizeLatex(token.slice(2, -2).trim()) });
    } else if (token.startsWith("$") && token.endsWith("$")) {
      segments.push({ kind: "inline-math", value: normalizeLatex(token.slice(1, -1).trim()) });
    } else if (allowBold && token.startsWith("**") && token.endsWith("**")) {
      segments.push({ kind: "bold", value: token.slice(2, -2) });
    } else if (token.startsWith("`") && token.endsWith("`")) {
      segments.push({ kind: "code", value: token.slice(1, -1) });
    }
    lastIndex = idx + token.length;
  }

  if (lastIndex < input.length) {
    segments.push({ kind: "text", value: input.slice(lastIndex) });
  }
  return segments;
}

function tokenizeMathAndText(input: string): Segment[] {
  // Older banks store paragraph breaks as a literal "\n". Only preserve "\n"
  // when followed by a lowercase letter (LaTeX commands like \neq, \nabla, \nu).
  const cleaned = sanitizeStudyText(input).replace(/\\n(?![a-z])/g, "\n");
  return tokenizeInline(cleaned, true);
}

function renderSegments(segments: Segment[]) {
  return segments.map((seg, i) => {
    if (seg.kind === "newline") {
      return <br key={i} />;
    }
    if (seg.kind === "bold") {
      return (
        <strong key={i} className="font-semibold text-[var(--text-primary)]">
          {renderSegments(tokenizeInline(seg.value, false))}
        </strong>
      );
    }
    if (seg.kind === "code") {
      return (
        <code
          key={i}
          className="rounded bg-[var(--bg-subtle)] px-1.5 py-0.5 font-mono text-[0.9em] text-[var(--text-primary)]"
        >
          {seg.value}
        </code>
      );
    }
    if (seg.kind === "inline-math") {
      const html = katex.renderToString(seg.value, {
        displayMode: false,
        throwOnError: false,
        strict: false,
      });
      return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
    }
    if (seg.kind === "display-math") {
      const html = katex.renderToString(seg.value, {
        displayMode: true,
        throwOnError: false,
        strict: false,
      });
      return (
        <span
          key={i}
          className="my-2 block max-w-full overflow-x-auto rounded-xl bg-[var(--bg-subtle)] px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    return <Fragment key={i}>{seg.value}</Fragment>;
  });
}

export function MathText({ text, className }: { text: string; className?: string }) {
  const segments = useMemo(() => tokenizeMathAndText(text), [text]);

  return <span className={cn("[overflow-wrap:anywhere]", className)}>{renderSegments(segments)}</span>;
}

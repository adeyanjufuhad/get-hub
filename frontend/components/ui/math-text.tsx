"use client";

import katex from "katex";
import { Fragment, useMemo } from "react";
import { cn } from "@/lib/cn";

interface Segment {
  kind: "text" | "bold" | "inline-math" | "display-math" | "newline";
  value: string;
}

function tokenizeMathAndText(input: string): Segment[] {
  const normalized = input.replace(/\\n/g, "\n");
  const segments: Segment[] = [];
  const regex = /(\$\$[\s\S]+?\$\$|\$(?!\$)[^$\n]+?\$|\*\*[^*]+\*\*|\n)/g;
  let lastIndex = 0;

  for (const match of normalized.matchAll(regex)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      segments.push({ kind: "text", value: normalized.slice(lastIndex, idx) });
    }
    const token = match[0];
    if (token === "\n") {
      segments.push({ kind: "newline", value: "\n" });
    } else if (token.startsWith("$$") && token.endsWith("$$")) {
      segments.push({ kind: "display-math", value: token.slice(2, -2).trim() });
    } else if (token.startsWith("$") && token.endsWith("$")) {
      segments.push({ kind: "inline-math", value: token.slice(1, -1).trim() });
    } else if (token.startsWith("**") && token.endsWith("**")) {
      segments.push({ kind: "bold", value: token.slice(2, -2) });
    }
    lastIndex = idx + token.length;
  }

  if (lastIndex < normalized.length) {
    segments.push({ kind: "text", value: normalized.slice(lastIndex) });
  }
  return segments;
}

export function MathText({ text, className }: { text: string; className?: string }) {
  const segments = useMemo(() => tokenizeMathAndText(text), [text]);

  return (
    <span className={cn("[overflow-wrap:anywhere]", className)}>
      {segments.map((seg, i) => {
        if (seg.kind === "newline") {
          return <br key={i} />;
        }
        if (seg.kind === "bold") {
          return (
            <strong key={i} className="font-semibold text-[var(--text-primary)]">
              {seg.value}
            </strong>
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
      })}
    </span>
  );
}

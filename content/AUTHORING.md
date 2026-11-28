# GET Hub — Study Notes Authoring Spec

Every topic ("folio") is one MDX file plus one question bank. Both are written
**strictly from the prescribed textbook** for the course:

| Course | Book (only source) | Local PDF |
|---|---|---|
| GET 209 | H. K. Dass, *Advanced Engineering Mathematics* (S. Chand) | `C:\Users\User\Downloads\NEW PART 2 TEXTS\h.k.dass_.pdf` |
| GET 207 | Beer, Johnston, Mazurek & Cornwell, *Vector Mechanics for Engineers: Statics & Dynamics*, 10th ed. | `C:\Users\User\Downloads\NEW PART 2 TEXTS\Vector Mechanics for Engineers -  Statics and Dynamics, 10th Edition by Beer, Johnston, Mazurek and Cornwell.pdf` |
| GET 207 (Statics solutions) | Beer & Johnston 10e Statics Solutions Manual | `C:\Users\User\Downloads\NEW PART 2 TEXTS\Beer Vector Mechanics for Engineers STATICS 10th solutions.pdf` |

GET 205 (fluids) has no textbook in that folder; do not touch it.

### Reading the PDFs

Text dumps with `<<<PAGE n>>>` markers (0-based PDF index) are in
`C:\Users\User\AppData\Local\Temp\gettexts\` (`hkdass_full.txt`,
`hibbeler14_full.txt`, `hibbeler14_solutions_full.txt`). Text extraction
mangles maths and drops figures, so render each page you use and look at it:

```
python -I -c "import pymupdf as f; d=f.open(r'<pdf>'); d[153].get_pixmap(dpi=110).save(r'<your scratch>/p153.png')"
```

Page offsets (printed page → PDF index):
- HK Dass: index = printed + 15 (Ch. 1 p.1, Ch. 3 p.138, Ch. 4 p.223, Ch. 5 p.372).
- Hibbeler Statics: index = printed + 25 (Ch. 2 p.17, Ch. 4 p.121, Ch. 5 p.207, Ch. 6 p.273, Ch. 8 p.401, Ch. 9 p.465, Ch. 10 p.529).
- Hibbeler Dynamics: index = printed + 705 (Ch. 12 p.3, Ch. 13 p.113, Ch. 14 p.179, Ch. 15 p.237).

Write the MDX early and extend it as you go, so progress survives interruptions.
If files for your topic already exist from an earlier attempt, check them against
the book and extend/fix them instead of starting over.

## Files

```
content/courses/<course>/course.json              topic list (slug, topicId, title, order, bookRef)
content/courses/<course>/topics/<slug>.mdx        the notes
content/courses/<course>/questions/<slug>.json    practice/test question bank
content/courses/<course>/diagrams/<slug>-<name>.svg   redrawn illustrations
```

Diagrams in `content/courses/<course>/diagrams/` are copied at build time to
`/diagrams/<course>/<file>` — always reference them by that URL.

Validate before you finish (from `frontend/`):

```
node scripts/validate-content.mjs get-209
```

It must report 0 errors for your topics.

## How "exact to the book" works here

- **Structure:** follow the book's section order and numbering exactly
  (`### 1.7 Partial Derivatives`). Every section in your assigned range
  appears, nothing from outside it is added.
- **Definitions, theorems, working rules, formulas:** reproduce them
  mathematically exactly — same symbols, same conditions, same cases. Put them
  in `<RuleBox>`.
- **Worked examples:** use the book's own solved examples, with the same
  example number, the same data and the same final answer, and solve them by
  the same method in full steps. Aim to cover **most** of the book's solved
  examples in the range (at least 10 per topic, more if the book has them).
- **Exercises:** reproduce the book's end-of-section exercise questions
  (problem data and the book's printed answers) in `<ExerciseSet>`. Check each
  answer before including it. Hibbeler answers come from the back of the book
  or the solutions manual. If an answer can't be confirmed, leave the question out.
- **Illustrations:** crop every figure the notes or questions need directly from the textbook PDF using PyMuPDF (`clip=fitz.Rect(...)` at ~150 DPI) and save as clean `.png` or `.webp` in `diagrams/` (`content/courses/<course>/diagrams/<slug>-<name>.png`). **Do not hand-draw SVGs.**
- **Prose:** write the explanations yourself, clearly and precisely, in the
  book's order and with its emphasis. Do not copy whole paragraphs word for
  word; the maths, data and answers carry the exactness.

## Frontmatter

```yaml
---
title: "…"                      # = course.json title
order: 2                        # = course.json order
topicId: "22222222-…"           # = course.json topicId (never invent)
courseCode: "GET 209"
courseSlug: "get-209"
ccmasRef: "…"                   # = course.json ccmasRef
textbookRef: "H. K. Dass · Ch. 1, §1.7–1.11"   # = course.json bookRef
outcomes:
  - "…"                         # 3–6 concrete "be able to solve …" outcomes
status: "published"
isFree: true
---
```

## Body layout

```
## Overview                          (short: what the chapter section covers, why it matters)
### 1.7 Partial Derivatives          (one ### per book section, in order)
   prose → <RuleBox> → <DiagramFigure> → <StepRevealExample> (the book's examples for that section)
<ExerciseSet …/>                     (after the sections it belongs to, as in the book)
## Common Exam Pitfalls              (<Callout variant="warning">)
## Summary of Formulas               (<RuleBox kind="formula">)
```

## Components (the only JSX allowed)

```mdx
<RuleBox kind="definition" title="§1.2 Limit of a function of two variables">
Markdown + $math$ inside. kind = definition | theorem | working-rule | formula | note
</RuleBox>

<DiagramFigure src="/diagrams/get-207/force-vectors-fig-2-10.svg" caption="Hibbeler Fig. 2–10 (redrawn) — …" />

<StepRevealExample
  title="Example 5 (§1.7)"
  source="H. K. Dass, Ch. 1, Example 5"
  figure="/diagrams/get-209/….svg"          (optional)
  problem="If $u = \\log(x^3 + y^3 + z^3 - 3xyz)$, show that …"
  steps={[
    "Step text with $math$ …",
    "…"
  ]}
  answer="$\\dfrac{-9}{(x+y+z)^2}$"          (optional, the book's final answer)
/>

<ExerciseSet
  title="Exercise 1.1"
  source="H. K. Dass, Ch. 1"
  items={[
    { q: "Find $\\dfrac{\\partial u}{\\partial x}$ if $u = \\tan^{-1}\\dfrac{y}{x}$.", a: "$\\dfrac{-y}{x^2+y^2}$" },
    { q: "…", a: "…", figure: "/diagrams/get-207/….svg" }
  ]}
/>

<Callout variant="warning" title="…">markdown</Callout>     variant = warning | tip | info
```

### Escaping rules (most compile errors come from these)

- **Plain attribute strings** (`problem="…"`, `answer="…"`, `title="…"`,
  `caption="…"`, `source="…"`) are JSX attributes: backslashes are NOT escape
  characters there, so write LaTeX with **single** backslashes
  (`problem="Find $\frac{dy}{dx}$ at $30^\circ$"`, matrix rows `\\`). They cannot
  contain a `"`; use `''` or rephrase.
- Inside **JS expressions** (`steps={["…"]}`, `items={[{ q: "…", a: "…" }]}`)
  every backslash is doubled: `\\frac`, `\\theta`, `\\,`, matrix rows `\\\\`.
  Escape inner quotes as `\"`. Do not put raw newlines inside a string.
- The validator renders every formula (prose, props and banks) with KaTeX, so a
  wrong escape shows up as a `KaTeX error` there.
- In **markdown prose** write LaTeX normally with single backslashes: `$\frac{a}{b}$`,
  display math with `$$ … $$` on their own lines.
- In prose never write bare `<` or `{` outside math. Use `$<$`, `$\{$`, or the words.
- Units: `$500\,\text{N}$`, degrees `$30^\circ$`, vectors `$\mathbf{F}$` / `$\vec{F}$`.

## Question bank (`questions/<slug>.json`)

12–20 questions per topic, all taken from the book's solved examples or exercises
(different ones from those already fully worked in the notes where possible),
mixing `numeric` and `mcq`.

```json
{
  "topicSlug": "partial-differentiation-and-eulers-theorem",
  "questions": [
    {
      "key": "ex-1-7-u-tan-inverse",
      "type": "numeric",
      "prompt": "Markdown + $math$ (single backslashes — this is JSON, so write \\frac in the file)",
      "image": "/diagrams/get-209/….svg",
      "answer": 2.5,
      "tolerancePct": 1,
      "unit": "kN",
      "solution": "Full markdown worked solution in the book's method.",
      "difficulty": "medium",
      "source": "H. K. Dass, Ch. 1, Exercise 1.2, Q4",
      "tags": ["euler-theorem"]
    },
    {
      "key": "ex-1-11-euler-degree",
      "type": "mcq",
      "prompt": "…",
      "options": [
        { "label": "A", "text": "$2$", "correct": false },
        { "label": "B", "text": "$3$", "correct": true },
        { "label": "C", "text": "$\\tfrac{1}{2}$", "correct": false },
        { "label": "D", "text": "$0$", "correct": false }
      ],
      "solution": "…",
      "difficulty": "easy",
      "source": "H. K. Dass, Ch. 1, Example 12",
      "tags": []
    }
  ]
}
```

- `key`: stable kebab-case id, unique within the file; never change it once
  published (the database id is derived from it).
- `numeric`: `answer` is a plain number in the stated `unit` (use `""` for
  unitless). `tolerancePct` defaults to 1. Use it when the answer is a single
  number; otherwise use `mcq`.
- `mcq`: exactly 4 options A–D, exactly one correct. Distractors must be plausible
  mistakes (sign error, wrong formula), not nonsense.
- `image` is optional; omit the key when there is no figure.

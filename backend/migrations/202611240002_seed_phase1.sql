-- +goose Up
-- +goose StatementBegin

-- Seed Courses (OAU 200L First Semester GET Courses)
INSERT INTO courses (id, code, slug, title, description, display_order, is_active) VALUES
  ('11111111-1111-4111-8111-111111111203', 'GET 203', 'get-203', 'Engineering Graphics and Solid Modelling I', 'Orthographic projection, auxiliary views, production drawings, solid & surface modelling, parametric design, and manufacturing drawings.', 1, TRUE),
  ('11111111-1111-4111-8111-111111111207', 'GET 207', 'get-207', 'Applied Mechanics', 'Forces, moments, couples, static equilibrium, friction, centroids, moments of area, kinematics, Newton''s laws, energy and momentum.', 2, TRUE),
  ('11111111-1111-4111-8111-111111111209', 'GET 209', 'get-209', 'Engineering Mathematics I', 'Limits, continuity, differentiation, first-order linear ODEs, partial & total derivatives, matrices, determinants, and vector calculus.', 3, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Seed 1 Original Draft Sample Topic per Course
INSERT INTO topics (id, course_id, slug, title, display_order, ccmas_ref, outcomes, status, is_free) VALUES
  (
    '22222222-2222-4222-8222-222222220203',
    '11111111-1111-4111-8111-111111111203',
    'projection-of-lines',
    'Projection of Straight Lines',
    1,
    'Projection of lines',
    '["Explain first-angle orthographic projection onto the HP and VP", "Determine front view and top view lengths of lines parallel or inclined to reference planes", "Find the true length and true inclinations of an oblique line using the rotation method"]'::jsonb,
    'draft',
    TRUE
  ),
  (
    '22222222-2222-4222-8222-222222220207',
    '11111111-1111-4111-8111-111111111207',
    'forces-moments-and-equilibrium',
    'Forces, Moments, Couples & 2D Equilibrium',
    1,
    'Forces, moments, couples; equilibrium of simple structures and machine parts',
    '["Resolve coplanar forces into rectangular x and y components", "Compute moments of forces and pure couples about any reference point", "Draw clear free-body diagrams and solve for support reactions using equilibrium equations"]'::jsonb,
    'draft',
    TRUE
  ),
  (
    '22222222-2222-4222-8222-222222220209',
    '11111111-1111-4111-8111-111111111209',
    'limits-and-continuity',
    'Limits and Continuity of Functions',
    1,
    'Limits; continuity',
    '["Evaluate algebraic and trigonometric limits including 0/0 indeterminate forms", "Compute limits at infinity for rational functions", "Test whether a piecewise function is continuous at a boundary point"]'::jsonb,
    'draft',
    TRUE
  )
ON CONFLICT (course_id, slug) DO NOTHING;

-- =====================================================================
-- GET 203 — 5 Original Draft Questions (including 2 SVG-image MCQs)
-- =====================================================================

-- Q1 (GET 203, Image-based MCQ)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, prompt_image_url, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000203001',
    '11111111-1111-4111-8111-111111111203',
    '22222222-2222-4222-8222-222222220203',
    'mcq',
    'A straight rod $PQ$ of length $60\,\text{mm}$ is **parallel to the Vertical Plane (VP)** and **inclined at $30^\circ$ to the Horizontal Plane (HP)** in first-angle projection. Point $P$ is $15\,\text{mm}$ above HP and $20\,\text{mm}$ in front of VP. Which option shows the correct **front view** ($p''q''$) relative to the $XY$ line?',
    '/diagrams/get-203/q1-front-view-prompt.svg',
    '**Step 1:** In first-angle projection, the Vertical Plane (VP) lies **above** the $XY$ reference line, so the front view $p''q''$ must be drawn above $XY$.\n\n**Step 2:** Because rod $PQ$ is **parallel to the VP**, its front view shows both the **true length** ($60\,\text{mm}$) and the **true inclination** to the HP ($30^\circ$).\n\n**Step 3:** Option **A** places $p''q''$ above $XY$, inclined at $30^\circ$ with length $60\,\text{mm}$. Options B, C, and D either draw it horizontal, place it below $XY$, or make it vertical.',
    'easy',
    ARRAY['orthographic', 'first-angle', 'front-view'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, image_url, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-000203001001', '33333333-3333-4333-8333-000000203001', 'A', 'Above $XY$, inclined at $30^\circ$ (true length)', '/diagrams/get-203/q1-opt-a.svg', TRUE, 1),
  ('44444444-4444-4444-8444-000203001002', '33333333-3333-4333-8333-000000203001', 'B', 'Above $XY$, horizontal line', '/diagrams/get-203/q1-opt-b.svg', FALSE, 2),
  ('44444444-4444-4444-8444-000203001003', '33333333-3333-4333-8333-000000203001', 'C', 'Below $XY$, inclined at $30^\circ$', '/diagrams/get-203/q1-opt-c.svg', FALSE, 3),
  ('44444444-4444-4444-8444-000203001004', '33333333-3333-4333-8333-000000203001', 'D', 'Above $XY$, vertical line', '/diagrams/get-203/q1-opt-d.svg', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- Q2 (GET 203, Image-based MCQ)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, prompt_image_url, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000203002',
    '11111111-1111-4111-8111-111111111203',
    '22222222-2222-4222-8222-222222220203',
    'mcq',
    'A vertical steel pin $AB$ is **perpendicular to the Horizontal Plane (HP)** and parallel to the VP (first-angle projection). Which diagram correctly represents its **top view (plan)** below the $XY$ line?',
    NULL,
    '**Step 1:** When you look straight down from above (top view) onto a pin standing perpendicular to the HP, point $A$ sits directly above point $B$.\n\n**Step 2:** Therefore, the entire line projects onto the HP as a **single point**, labeled $a(b)$, positioned below the $XY$ line in first-angle projection.\n\n**Step 3:** Option **A** shows the single point below $XY$.',
    'easy',
    ARRAY['orthographic', 'top-view', 'perpendicular'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, image_url, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-000203002001', '33333333-3333-4333-8333-000000203002', 'A', 'Single point $a(b)$ below $XY$', '/diagrams/get-203/q2-opt-a.svg', TRUE, 1),
  ('44444444-4444-4444-8444-000203002002', '33333333-3333-4333-8333-000000203002', 'B', 'Vertical segment below $XY$', '/diagrams/get-203/q2-opt-b.svg', FALSE, 2),
  ('44444444-4444-4444-8444-000203002003', '33333333-3333-4333-8333-000000203002', 'C', 'Horizontal segment below $XY$', '/diagrams/get-203/q2-opt-c.svg', FALSE, 3),
  ('44444444-4444-4444-8444-000203002004', '33333333-3333-4333-8333-000000203002', 'D', 'Inclined segment below $XY$', '/diagrams/get-203/q2-opt-d.svg', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- Q3 (GET 203, Numeric)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000203003',
    '11111111-1111-4111-8111-111111111203',
    '22222222-2222-4222-8222-222222220203',
    'numeric',
    'A straight bracket edge $CD$ has a true length of $80\,\text{mm}$. It is parallel to the VP and inclined at $\theta = 35^\circ$ to the HP. Calculate the length of its **top view (plan)** in millimetres.',
    65.53,
    1.0,
    'mm',
    '**Step 1:** Because $CD$ is parallel to the VP and inclined at $\theta = 35^\circ$ to the HP, its projection onto the HP (the top view) is foreshortened by $\cos\theta$.\n\n**Step 2:** Apply the plan-length formula:\n$$L_{\text{plan}} = L \cos 35^\circ = 80 \times 0.81915 \approx 65.53\,\text{mm}$$',
    'medium',
    ARRAY['plan-length', 'foreshortening'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- Q4 (GET 203, MCQ)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000203004',
    '11111111-1111-4111-8111-111111111203',
    '22222222-2222-4222-8222-222222220203',
    'mcq',
    'In first-angle orthographic projection, if a line is **parallel to both HP and VP**, how do its front view and top view appear relative to the $XY$ line?',
    '**Step 1:** A line parallel to the HP has constant elevation, so its front view is parallel to $XY$.\n\n**Step 2:** A line parallel to the VP has constant distance in front of VP, so its top view is also parallel to $XY$.\n\n**Step 3:** Neither view is foreshortened, so **both views are parallel to $XY$ and equal to the true length**.',
    'easy',
    ARRAY['parallel-lines', 'true-length'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-000203004001', '33333333-3333-4333-8333-000000203004', 'A', 'Both views are parallel to $XY$ and equal to the true length.', TRUE, 1),
  ('44444444-4444-4444-8444-000203004002', '33333333-3333-4333-8333-000000203004', 'B', 'The front view is a single point and the top view is true length.', FALSE, 2),
  ('44444444-4444-4444-8444-000203004003', '33333333-3333-4333-8333-000000203004', 'C', 'Both views are foreshortened and inclined to $XY$.', FALSE, 3),
  ('44444444-4444-4444-8444-000203004004', '33333333-3333-4333-8333-000000203004', 'D', 'The front view is perpendicular to $XY$ while the top view is parallel to $XY$.', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- Q5 (GET 203, Numeric)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000203005',
    '11111111-1111-4111-8111-111111111203',
    '22222222-2222-4222-8222-222222220203',
    'numeric',
    'An oblique line $MN$ is inclined to both HP and VP. Its front view shows a vertical height difference $\Delta z = 42\,\text{mm}$ between its ends, and its top view has a plan length of $56\,\text{mm}$. Using the right-triangle (rotation) method, find the **true length** of $MN$ in mm.',
    70.0,
    1.0,
    'mm',
    '**Step 1:** Rotating the top view until it is parallel to $XY$ preserves both the plan length ($56\,\text{mm}$) and the height difference ($\Delta z = 42\,\text{mm}$), forming a right-angled triangle.\n\n**Step 2:** Apply Pythagoras'' theorem:\n$$L = \sqrt{56^2 + 42^2} = \sqrt{3136 + 1764} = \sqrt{4900} = 70\,\text{mm}$$',
    'hard',
    ARRAY['oblique-line', 'true-length', 'rotation-method'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- GET 207 — 5 Original Draft Questions (Forces, Moments & Equilibrium)
-- =====================================================================

-- Q1 (GET 207, MCQ)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000207001',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222220207',
    'mcq',
    'Two perpendicular coplanar forces of $30\,\text{N}$ along the $+x$-axis and $40\,\text{N}$ along the $+y$-axis act on a gusset plate. What is the magnitude of their resultant force $R$?',
    '**Step 1:** Since the forces act along orthogonal axes, their components are $R_x = 30\,\text{N}$ and $R_y = 40\,\text{N}$.\n\n**Step 2:** Compute the magnitude:\n$$R = \sqrt{R_x^2 + R_y^2} = \sqrt{30^2 + 40^2} = \sqrt{900 + 1600} = \sqrt{2500} = 50\,\text{N}$$',
    'easy',
    ARRAY['forces', 'resultant'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-000207001001', '33333333-3333-4333-8333-000000207001', 'A', '$10\,\text{N}$', FALSE, 1),
  ('44444444-4444-4444-8444-000207001002', '33333333-3333-4333-8333-000000207001', 'B', '$50\,\text{N}$', TRUE, 2),
  ('44444444-4444-4444-8444-000207001003', '33333333-3333-4333-8333-000000207001', 'C', '$70\,\text{N}$', FALSE, 3),
  ('44444444-4444-4444-8444-000207001004', '33333333-3333-4333-8333-000000207001', 'D', '$35\,\text{N}$', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- Q2 (GET 207, Numeric)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, prompt_image_url, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000207002',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222220207',
    'numeric',
    'A light horizontal beam $AB$ of span $6.0\,\text{m}$ is simply supported by a pin at $A$ and a roller at $B$. A single downward point load of $120\,\text{N}$ acts $2.0\,\text{m}$ to the right of $A$. Find the upward reaction $R_B$ at support $B$ (in Newtons).',
    '/diagrams/get-207/beam-fbd.svg',
    40.0,
    1.0,
    'N',
    '**Step 1:** Take moments about pin $A$ (choosing anticlockwise as positive) so the unknown $R_A$ drops out:\n$$\sum M_A = 0$$\n\n**Step 2:** Write the moment terms:\n$$R_B(6.0) - 120(2.0) = 0$$\n\n**Step 3:** Solve for $R_B$:\n$$R_B = \frac{240}{6.0} = 40\,\text{N}$$',
    'medium',
    ARRAY['beam', 'reactions', 'moments'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- Q3 (GET 207, MCQ)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000207003',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222220207',
    'mcq',
    'A **force couple** consists of two equal parallel forces of magnitude $F$ acting in opposite directions, separated by a perpendicular distance $d$. Which statement correctly describes a couple?',
    '**Step 1:** Because the two forces are equal and opposite, their vector sum is $\vec{F} + (-\vec{F}) = \vec{0}$ — a couple produces pure rotation with zero net translation.\n\n**Step 2:** Taking moments about any point at distance $x$ from the first force gives $M = F(x + d) - F x = F d$, independent of $x$. Thus a couple is a **free vector** with the same moment about every point in its plane.',
    'medium',
    ARRAY['couples', 'moments'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-000207003001', '33333333-3333-4333-8333-000000207003', 'A', 'Its resultant force is $2F$ and its moment depends on the chosen pivot point.', FALSE, 1),
  ('44444444-4444-4444-8444-000207003002', '33333333-3333-4333-8333-000000207003', 'B', 'Its resultant force is zero, and its moment $M = Fd$ is identical about every point in its plane.', TRUE, 2),
  ('44444444-4444-4444-8444-000207003003', '33333333-3333-4333-8333-000000207003', 'C', 'Its resultant force is $F$ and its net moment is zero.', FALSE, 3),
  ('44444444-4444-4444-8444-000207003004', '33333333-3333-4333-8333-000000207003', 'D', 'A couple can always be balanced by a single force passing through its midpoint.', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- Q4 (GET 207, Numeric)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000207004',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222220207',
    'numeric',
    'A workshop technician pushes perpendicular to a spanner handle with a force of $85\,\text{N}$ at a distance of $0.32\,\text{m}$ from the bolt centre. Calculate the magnitude of the turning moment about the bolt (in $\text{N}\cdot\text{m}$).',
    27.2,
    1.0,
    'N·m',
    '**Step 1:** Since the force is perpendicular to the handle, the perpendicular lever arm is $d = 0.32\,\text{m}$.\n\n**Step 2:** Multiply force by lever arm:\n$$M = F \times d = 85\,\text{N} \times 0.32\,\text{m} = 27.2\,\text{N}\cdot\text{m}$$',
    'easy',
    ARRAY['moment', 'torque'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- Q5 (GET 207, MCQ)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000207005',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222220207',
    'mcq',
    'For a rigid body lying in the $xy$-plane to be in complete static equilibrium, which set of scalar equations must simultaneously be satisfied?',
    '**Step 1:** Preventing linear acceleration in 2D requires both $\sum F_x = 0$ and $\sum F_y = 0$.\n\n**Step 2:** Preventing angular acceleration in the plane requires $\sum M_O = 0$ about any reference point $O$.\n\n**Step 3:** All three conditions together ($\sum F_x = 0, \sum F_y = 0, \sum M_O = 0$) define 2D static equilibrium.',
    'easy',
    ARRAY['equilibrium', 'statics'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-000207005001', '33333333-3333-4333-8333-000000207005', 'A', '$\sum F_x = 0$ and $\sum F_y = 0$ only', FALSE, 1),
  ('44444444-4444-4444-8444-000207005002', '33333333-3333-4333-8333-000000207005', 'B', '$\sum M_O = 0$ only', FALSE, 2),
  ('44444444-4444-4444-8444-000207005003', '33333333-3333-4333-8333-000000207005', 'C', '$\sum F_x = 0,\; \sum F_y = 0,\; \sum M_O = 0$', TRUE, 3),
  ('44444444-4444-4444-8444-000207005004', '33333333-3333-4333-8333-000000207005', 'D', '$\sum F_x = \sum F_y$ and $\sum M_O \neq 0$', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- =====================================================================
-- GET 209 — 5 Original Draft Questions (Limits and Continuity)
-- =====================================================================

-- Q1 (GET 209, Numeric)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000209001',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222220209',
    'numeric',
    'Evaluate the limit:\n$$\lim_{x \to 3} \frac{x^2 - 9}{x - 3}$$',
    6.0,
    1.0,
    '',
    '**Step 1:** Direct substitution at $x = 3$ yields $\frac{9 - 9}{3 - 3} = \frac{0}{0}$ (an indeterminate form).\n\n**Step 2:** Factor the numerator as a difference of squares:\n$$\frac{x^2 - 9}{x - 3} = \frac{(x - 3)(x + 3)}{x - 3}$$\n\n**Step 3:** Cancel $(x - 3)$ (valid for $x \neq 3$) and substitute $x = 3$:\n$$\lim_{x \to 3} (x + 3) = 3 + 3 = 6$$',
    'easy',
    ARRAY['limits', 'factoring', 'indeterminate'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- Q2 (GET 209, MCQ)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000209002',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222220209',
    'mcq',
    'Evaluate the trigonometric limit:\n$$\lim_{x \to 0} \frac{\sin(5x)}{2x}$$',
    '**Step 1:** Recall the standard limit $\lim_{u \to 0} \frac{\sin u}{u} = 1$.\n\n**Step 2:** Multiply numerator and denominator by $5$ so the denominator matches $5x$:\n$$\lim_{x \to 0} \frac{\sin(5x)}{2x} = \frac{5}{2} \lim_{x \to 0} \frac{\sin(5x)}{5x} = \frac{5}{2} \times 1 = \frac{5}{2}$$',
    'medium',
    ARRAY['limits', 'trigonometric'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-000209002001', '33333333-3333-4333-8333-000000209002', 'A', '$0$', FALSE, 1),
  ('44444444-4444-4444-8444-000209002002', '33333333-3333-4333-8333-000000209002', 'B', '$\frac{2}{5}$', FALSE, 2),
  ('44444444-4444-4444-8444-000209002003', '33333333-3333-4333-8333-000000209002', 'C', '$\frac{5}{2}$', TRUE, 3),
  ('44444444-4444-4444-8444-000209002004', '33333333-3333-4333-8333-000000209002', 'D', '$5$', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- Q3 (GET 209, Numeric)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000209003',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222220209',
    'numeric',
    'Evaluate the limit at infinity:\n$$\lim_{x \to \infty} \frac{6x^2 - 5x + 1}{2x^2 + 3x - 4}$$',
    3.0,
    1.0,
    '',
    '**Step 1:** Divide every term in the numerator and denominator by the highest power of $x$ in the denominator, which is $x^2$:\n$$\lim_{x \to \infty} \frac{6 - \frac{5}{x} + \frac{1}{x^2}}{2 + \frac{3}{x} - \frac{4}{x^2}}$$\n\n**Step 2:** As $x \to \infty$, all $\frac{c}{x^n}$ terms approach $0$:\n$$= \frac{6 - 0 + 0}{2 + 0 - 0} = \frac{6}{2} = 3$$',
    'easy',
    ARRAY['limits', 'infinity', 'rational'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- Q4 (GET 209, MCQ)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000209004',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222220209',
    'mcq',
    'Which three conditions must **all** hold for a function $f(x)$ to be continuous at a point $x = c$?',
    '**Step 1:** First, $f(c)$ must be **defined** (there cannot be an undefined hole at $c$).\n\n**Step 2:** Second, the two-sided limit $\lim_{x \to c} f(x)$ must **exist** (left-hand limit equals right-hand limit).\n\n**Step 3:** Third, the limit value must equal the function value: $\lim_{x \to c} f(x) = f(c)$.',
    'easy',
    ARRAY['continuity', 'definition'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-000209004001', '33333333-3333-4333-8333-000000209004', 'A', '$f(c)$ is defined, $\lim_{x \to c} f(x)$ exists, and $\lim_{x \to c} f(x) = f(c)$.', TRUE, 1),
  ('44444444-4444-4444-8444-000209004002', '33333333-3333-4333-8333-000000209004', 'B', '$f''(c)$ exists and $f(c) = 0$.', FALSE, 2),
  ('44444444-4444-4444-8444-000209004003', '33333333-3333-4333-8333-000000209004', 'C', 'Only the left-hand limit $\lim_{x \to c^-} f(x)$ exists and equals $f(c)$.', FALSE, 3),
  ('44444444-4444-4444-8444-000209004004', '33333333-3333-4333-8333-000000209004', 'D', '$f(c)$ is defined and $f(x) > 0$ near $c$.', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- Q5 (GET 209, Numeric)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000209005',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222220209',
    'numeric',
    'Find the constant $k$ that makes the following piecewise function continuous at $x = 2$:\n$$f(x) = \begin{cases} 3x + k, & x < 2 \\ x^2 + 5, & x \ge 2 \end{cases}$$',
    3.0,
    1.0,
    '',
    '**Step 1:** Find the left-hand limit as $x \to 2^-$:\n$$\lim_{x \to 2^-} (3x + k) = 3(2) + k = 6 + k$$\n\n**Step 2:** Find the right-hand limit and function value at $x = 2$:\n$$f(2) = \lim_{x \to 2^+} (x^2 + 5) = 2^2 + 5 = 9$$\n\n**Step 3:** Equate left and right limits for continuity:\n$$6 + k = 9 \implies k = 3$$',
    'medium',
    ARRAY['continuity', 'piecewise'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM questions WHERE id::text LIKE '33333333-3333-4333-8333-%';
DELETE FROM topics WHERE id::text LIKE '22222222-2222-4222-8222-%';
DELETE FROM courses WHERE id::text LIKE '11111111-1111-4111-8111-%';
-- +goose StatementEnd

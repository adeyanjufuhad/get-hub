-- +goose Up
-- +goose StatementBegin

-- =====================================================================
-- Publish all 9 topics & questions and seed 18 strict verbatim textbook
-- questions with real cropped figures from:
--   • GET 205: Çengel, Turner & Cimbala — Fundamentals of Thermal-Fluid Sciences
--   • GET 207: R. C. Hibbeler — Engineering Mechanics: Statics & Dynamics (14e)
--   • GET 209: James Stewart — Calculus: Early Transcendentals (7e) & Bird Ch. 60
-- =====================================================================

UPDATE topics SET status = 'published' WHERE status = 'draft';
UPDATE questions SET status = 'published' WHERE status = 'draft';

-- ---------------------------------------------------------------------
-- GET 205 — Topic 1: Fluid Properties, Hydrostatic Pressure & Manometry
-- ---------------------------------------------------------------------
INSERT INTO questions (
  id, course_id, topic_id, question_type, prompt_md, prompt_image_url,
  numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md,
  difficulty, tags, source, status, is_free
) VALUES
  (
    '33333333-3333-4333-8333-000205070001',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222220205',
    'numeric',
    '**[Çengel · Ch. 2, Example 2–5]** A manometer is used to measure the pressure in a gas tank. The manometer fluid has specific gravity $SG = 0.85$, and the column height is $h = 55\,\text{cm}$, as shown in the figure. If the local atmospheric pressure is $P_{\text{atm}} = 96\,\text{kPa}$, determine the **absolute pressure** $P$ within the tank (in $\text{kPa}$, taking $g = 9.81\,\text{m/s}^2$).',
    '/images/textbook-figures/get-205/cengel-fig-2-47-manometer.webp',
    100.59,
    1.0,
    'kPa',
    '**Step 1 (Fluid density):** $\rho = SG \cdot \rho_{\text{H}_2\text{O}} = (0.85)(1000\,\text{kg/m}^3) = 850\,\text{kg/m}^3$.\n\n**Step 2 (Hydrostatic column pressure):** With $h = 0.55\,\text{m}$,\n$$\rho g h = (850)(9.81)(0.55) = 4586.2\,\text{Pa} \approx 4.59\,\text{kPa}$$\n\n**Step 3 (Absolute tank pressure):**\n$$P = P_{\text{atm}} + \rho g h = 96 + 4.59 = 100.59\,\text{kPa} \;\;(\text{Çengel prints } 100.6\,\text{kPa})$$',
    'easy',
    ARRAY['textbook-strict', 'cengel-ex-2-5', 'manometry'],
    'original',
    'published',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000205070002',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222220205',
    'numeric',
    '**[Çengel · Ch. 11, Example 11–1]** A heavy car plunges into a lake and lands horizontally at the bottom on its wheels, as shown in the figure. Its vertical rectangular door is $1.2\,\text{m}$ high and $1.0\,\text{m}$ wide, with its top edge $8.0\,\text{m}$ below the free surface ($\rho = 1000\,\text{kg/m}^3$, $g = 9.81\,\text{m/s}^2$). Assuming the cabin remains sealed at atmospheric pressure, determine the resultant hydrostatic force $F_R$ on the door (in $\text{kN}$).',
    '/images/textbook-figures/get-205/cengel-fig-11-9-car-door.webp',
    101.24,
    1.0,
    'kN',
    '**Step 1 (Centroid depth & average pressure):** Atmospheric pressure cancels across both sides of the sealed door. The door centroid lies at $h_C = s + b/2 = 8.0 + 1.2/2 = 8.6\,\text{m}$:\n$$P_{\text{ave}} = \rho g h_C = (1000)(9.81)(8.6) = 84.37\,\text{kN/m}^2$$\n\n**Step 2 (Resultant hydrostatic force):** For door area $A = (1.0\,\text{m})(1.2\,\text{m}) = 1.2\,\text{m}^2$:\n$$F_R = P_{\text{ave}} A = 84.37 \times 1.2 = 101.24\,\text{kN} \;\;(\text{Çengel prints } 101.3\,\text{kN})$$',
    'medium',
    ARRAY['textbook-strict', 'cengel-ex-11-1', 'submerged-surfaces'],
    'original',
    'published',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- GET 205 — Topic 2: Buoyancy, Archimedes' Principle & Stability
-- ---------------------------------------------------------------------
INSERT INTO questions (
  id, course_id, topic_id, question_type, prompt_md, prompt_image_url,
  numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md,
  difficulty, tags, source, status, is_free
) VALUES
  (
    '33333333-3333-4333-8333-000205070003',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222250002',
    'numeric',
    '**[Çengel · Ch. 11, Example 11–4]** A crane lowers a rectangular $0.4\,\text{m} \times 0.4\,\text{m} \times 3\,\text{m}$ concrete block ($\rho_{\text{concrete}} = 2300\,\text{kg/m}^3$) completely into seawater ($\rho_f = 1025\,\text{kg/m}^3$, $g = 9.81\,\text{m/s}^2$), as shown in the figure. Determine the tension $F_{T,\text{water}}$ in the crane rope when the block is completely immersed (in $\text{kN}$).',
    '/images/textbook-figures/get-205/cengel-fig-11-19-seawater-block.webp',
    6.0,
    1.5,
    'kN',
    '**Step 1 (Block volume & weight in air):** $V = (0.4)(0.4)(3) = 0.48\,\text{m}^3$, so\n$$W = \rho_{\text{concrete}} g V = (2300)(9.81)(0.48) = 10.83\,\text{kN}$$\n\n**Step 2 (Buoyant force in seawater):**\n$$F_B = \rho_f g V = (1025)(9.81)(0.48) = 4.83\,\text{kN}$$\n\n**Step 3 (Immersed rope tension):**\n$$F_{T,\text{water}} = W - F_B = 10.83 - 4.83 = 6.00\,\text{kN}$$',
    'medium',
    ARRAY['textbook-strict', 'cengel-ex-11-4', 'buoyancy'],
    'original',
    'published',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000205070004',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222250002',
    'numeric',
    '**[Çengel · Ch. 11, Example 11–3(b)]** Determine the mass of lead (in **grams**) that must be poured into the bottom of a $1\,\text{cm}$-diameter, $20\,\text{cm}$-long cylindrical glass hydrometer if it is to float halfway submerged (at the $10\,\text{cm}$ mark) in pure water ($\rho_w = 1000\,\text{kg/m}^3$), neglecting the weight of the thin glass tube.',
    NULL,
    7.85,
    1.0,
    'g',
    '**Step 1:** Floating equilibrium gives $W = mg = \rho_w g V_{\text{sub}} \implies m = \rho_w V_{\text{sub}}$.\n\n**Step 2:** With radius $R = 0.005\,\text{m}$ and submerged depth $h_{\text{sub}} = 0.10\,\text{m}$:\n$$m = (1000\,\text{kg/m}^3)\bigl[\pi (0.005\,\text{m})^2 (0.10\,\text{m})\bigr] = 0.007854\,\text{kg} = 7.85\,\text{g}$$',
    'medium',
    ARRAY['textbook-strict', 'cengel-ex-11-3', 'hydrometer'],
    'original',
    'published',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- GET 205 — Topic 3: Continuity, Bernoulli's Equation & Flow Measurement
-- ---------------------------------------------------------------------
INSERT INTO questions (
  id, course_id, topic_id, question_type, prompt_md, prompt_image_url,
  numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md,
  difficulty, tags, source, status, is_free
) VALUES
  (
    '33333333-3333-4333-8333-000205070005',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222250003',
    'numeric',
    '**[Çengel · Ch. 12, Example 12–6]** A piezometer and a Pitot tube are tapped into a horizontal water pipe as shown in the figure, with $h_1 = 3\,\text{cm}$, $h_2 = 7\,\text{cm}$, and excess Pitot stagnation column height $h_3 = 12\,\text{cm}$. Taking $g = 9.81\,\text{m/s}^2$, determine the water velocity $V_1$ at the center of the pipe (in $\text{m/s}$).',
    '/images/textbook-figures/get-205/cengel-fig-12-27-pitot-tube.webp',
    1.53,
    1.0,
    'm/s',
    '**Step 1:** Static pressure at 1 is $P_1 = \rho g(h_1 + h_2)$, while stagnation pressure at tip 2 ($V_2 = 0$) is $P_2 = \rho g(h_1 + h_2 + h_3)$.\n\n**Step 2:** Apply Bernoulli between 1 and 2 ($z_1 = z_2$):\n$$\frac{V_1^2}{2g} = \frac{P_2 - P_1}{\rho g} = h_3$$\n\n**Step 3:** Substitute $h_3 = 0.12\,\text{m}$:\n$$V_1 = \sqrt{2(9.81)(0.12)} = 1.534\,\text{m/s} \approx 1.53\,\text{m/s}$$',
    'medium',
    ARRAY['textbook-strict', 'cengel-ex-12-6', 'pitot-tube'],
    'original',
    'published',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000205070006',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222250003',
    'numeric',
    '**[Çengel · Ch. 12, Example 12–3]** Water ($\rho = 1000\,\text{kg/m}^3$) flows from a hose attached to a water main at $400\,\text{kPa}$ gage. A child covers most of the hose outlet with his thumb so a thin vertical jet emerges into atmospheric air ($g = 9.81\,\text{m/s}^2$). Neglecting air drag and nozzle losses, find the maximum height $z_2$ (in $\text{m}$) to which the water jet can rise.',
    NULL,
    40.77,
    1.0,
    'm',
    '**Step 1:** Apply Bernoulli between inside the hose ($P_{1,\text{gage}} = 400\,\text{kPa}$, $V_1 \approx 0$, $z_1 = 0$) and the peak of the jet ($P_{2,\text{gage}} = 0$, $V_2 = 0$):\n$$z_2 = \frac{P_{1,\text{gage}}}{\rho g} = \frac{400\,000}{(1000)(9.81)} = 40.77\,\text{m} \;\;(\text{Çengel prints } 40.8\,\text{m})$$',
    'easy',
    ARRAY['textbook-strict', 'cengel-ex-12-3', 'bernoulli'],
    'original',
    'published',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- GET 207 — Topic 1: Forces, Moments, Couples & 2D Equilibrium
-- ---------------------------------------------------------------------
INSERT INTO questions (
  id, course_id, topic_id, question_type, prompt_md, prompt_image_url,
  numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md,
  difficulty, tags, source, status, is_free
) VALUES
  (
    '33333333-3333-4333-8333-000207070001',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222220207',
    'numeric',
    '**[Hibbeler 14e · Ch. 4, Prob. F4–1]** Determine the **magnitude** of the moment of the $100\,\text{N}$ force (on a $3\text{–}4\text{–}5$ slope) about support point $O$ for the L-shaped bracket shown in the figure (in $\text{N}\cdot\text{m}$).',
    '/images/textbook-figures/get-207/hibbeler-f4-1-moment.webp',
    460.0,
    1.0,
    'N·m',
    '**Step 1 (Resolve into rectangular components):**\n$$F_x = \frac{4}{5}(100\,\text{N}) = 80\,\text{N}\;(\rightarrow), \qquad F_y = \frac{3}{5}(100\,\text{N}) = 60\,\text{N}\;(\downarrow)$$\n\n**Step 2 (Varignon''s theorem about $O$, taking $\curvearrowleft +$):** Both components rotate the bracket **clockwise** about $O$:\n$$M_O = -(80\,\text{N})(2\,\text{m}) - (60\,\text{N})(5\,\text{m}) = -160 - 300 = -460\,\text{N}\cdot\text{m}$$\nMagnitude $= 460\,\text{N}\cdot\text{m}$ (clockwise).',
    'easy',
    ARRAY['textbook-strict', 'hibbeler-f4-1', 'moments'],
    'original',
    'published',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000207070002',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222220207',
    'numeric',
    '**[Hibbeler 14e · Ch. 5, Prob. F5–2]** Beam $AB$ is supported by pin $A$ and inclined two-force strut $CD$, as shown in the figure. Under the vertical $4\,\text{kN}$ load at $B$, determine the magnitude of the force $F_{CD}$ acting along member $CD$ (in $\text{kN}$).',
    '/images/textbook-figures/get-207/hibbeler-f5-2-beam.webp',
    11.31,
    1.0,
    'kN',
    '**Step 1:** Since $AC = 1.5\,\text{m}$ and $AD = 1.5\,\text{m}$, two-force strut $CD$ acts at $45^\circ$ to beam $AB$.\n\n**Step 2:** Sum moments about pin $A$ ($\curvearrowleft + \sum M_A = 0$):\n$$(F_{CD}\sin 45^\circ)(1.5\,\text{m}) - (4\,\text{kN})(3.0\,\text{m}) = 0$$\n\n**Step 3:** Solve for $F_{CD}$:\n$$F_{CD} = \frac{12}{1.5 \sin 45^\circ} = \frac{8}{\sin 45^\circ} = 11.31\,\text{kN}$$',
    'medium',
    ARRAY['textbook-strict', 'hibbeler-f5-2', 'beam-equilibrium'],
    'original',
    'published',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- GET 207 — Topic 2: Dry Friction on Inclined Planes, Ladders & Wedges
-- ---------------------------------------------------------------------
INSERT INTO questions (
  id, course_id, topic_id, question_type, prompt_md, prompt_image_url,
  numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md,
  difficulty, tags, source, status, is_free
) VALUES
  (
    '33333333-3333-4333-8333-000207070003',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222270002',
    'numeric',
    '**[Hibbeler 14e · Ch. 8, Prob. F8–1(a)]** Determine the friction force $F$ (in $\text{N}$) developed between the $50\,\text{kg}$ crate and the ground in the figure when $P = 200\,\text{N}$ (acting on a $3\text{–}4\text{–}5$ slope). Take $\mu_s = 0.3$, $\mu_k = 0.2$, and $g = 9.81\,\text{m/s}^2$.',
    '/images/textbook-figures/get-207/hibbeler-f8-1-crate.webp',
    160.0,
    1.0,
    'N',
    '**Step 1 (Normal reaction):** $+ \uparrow \sum F_y = 0 \implies N_C - 50(9.81) - \frac{3}{5}(200) = 0 \implies N_C = 490.5 + 120 = 610.5\,\text{N}$.\n\n**Step 2 (Check slipping threshold):** Maximum static friction is $F_{\max} = \mu_s N_C = 0.3(610.5) = 183.15\,\text{N}$.\n\n**Step 3 (Horizontal force demand):** Horizontal component of $P$ is $P_x = \frac{4}{5}(200) = 160\,\text{N}$. Since $160\,\text{N} < 183.15\,\text{N}$, the crate **does not slip**, so $F = 160\,\text{N}$!',
    'medium',
    ARRAY['textbook-strict', 'hibbeler-f8-1', 'dry-friction'],
    'original',
    'published',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000207070004',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222270002',
    'numeric',
    '**[Hibbeler 14e · Ch. 8, Prob. F8–2]** Determine the minimum horizontal force $P$ (in $\text{N}$) needed to prevent the $30\,\text{kg}$ uniform rod $AB$ in the figure from sliding. The floor surface at $B$ is smooth, whereas the coefficient of static friction between the rod and the vertical wall at $A$ is $\mu_s = 0.2$ ($g = 9.81\,\text{m/s}^2$).',
    '/images/textbook-figures/get-207/hibbeler-f8-2-ladder.webp',
    154.89,
    1.0,
    'N',
    '**Step 1:** At minimum $P$, end $A$ is about to slide **down** the wall, so upward wall friction is $F_A = \mu_s N_A = 0.2 N_A$.\n\n**Step 2:** Sum moments about $B$ ($\curvearrowleft + \sum M_B = 0$):\n$$N_A(3\,\text{m}) + 0.2 N_A(4\,\text{m}) - 30(9.81)(2\,\text{m}) = 0 \implies 3.8 N_A = 588.6 \implies N_A = 154.89\,\text{N}$$\n\n**Step 3:** Horizontal equilibrium ($\sum F_x = 0$) gives $P = N_A = 154.89\,\text{N}$ (Hibbeler rounds to $155\,\text{N}$).',
    'medium',
    ARRAY['textbook-strict', 'hibbeler-f8-2', 'ladder-friction'],
    'original',
    'published',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- GET 207 — Topic 3: Centroids, First & Second Moments of Area
-- ---------------------------------------------------------------------
INSERT INTO questions (
  id, course_id, topic_id, question_type, prompt_md, prompt_image_url,
  numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md,
  difficulty, tags, source, status, is_free
) VALUES
  (
    '33333333-3333-4333-8333-000207070005',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222270003',
    'numeric',
    '**[Hibbeler 14e · Ch. 9, Prob. F9–8]** Locate the vertical centroid coordinate $\bar{y}$ (in $\text{mm}$, measured upward from the bottom $x$-axis) of the T-beam cross-sectional area shown in the figure.',
    '/images/textbook-figures/get-207/hibbeler-f9-8-tbeam-centroid.webp',
    237.5,
    1.0,
    'mm',
    '**Step 1 (Subdivide into vertical stem + top flange):**\n- Vertical stem ($50\,\text{mm} \times 300\,\text{mm}$): $A_1 = 15\,000\,\text{mm}^2$, $\tilde{y}_1 = 150\,\text{mm}$.\n- Top flange ($300\,\text{mm} \times 50\,\text{mm}$): $A_2 = 15\,000\,\text{mm}^2$, $\tilde{y}_2 = 300 + 25 = 325\,\text{mm}$.\n\n**Step 2 (Composite centroid $\bar{y}$):**\n$$\bar{y} = \frac{15\,000(150) + 15\,000(325)}{15\,000 + 15\,000} = \frac{150 + 325}{2} = 237.5\,\text{mm}$$',
    'easy',
    ARRAY['textbook-strict', 'hibbeler-f9-8', 'centroids'],
    'original',
    'published',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000207070006',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222270003',
    'numeric',
    '**[Hibbeler 14e · Ch. 10, Prob. F10–8]** Determine the moment of inertia $I_{x''}$ of the T-beam cross-section shown in the figure about its horizontal centroidal $x''$-axis, expressed in **$10^6\,\text{mm}^4$** (e.g., enter `27.0` for $27.0 \times 10^6\,\text{mm}^4$).',
    '/images/textbook-figures/get-207/hibbeler-f10-8-tbeam-moi.webp',
    27.0,
    1.0,
    '×10⁶ mm⁴',
    '**Step 1 (Centroid $\bar{y}$):** Flange $A_1 = 150(30) = 4500\,\text{mm}^2$ at $\tilde{y}_1 = 15\,\text{mm}$; Web $A_2 = 30(150) = 4500\,\text{mm}^2$ at $\tilde{y}_2 = 105\,\text{mm}$:\n$$\bar{y} = \frac{15(4500) + 105(4500)}{9000} = 60\,\text{mm}$$\n\n**Step 2 (Parallel-Axis Theorem):** Both shift distances equal $d = 45\,\text{mm}$:\n$$I_{x''} = \left[\frac{1}{12}(150)(30)^3 + 4500(45)^2\right] + \left[\frac{1}{12}(30)(150)^3 + 4500(45)^2\right] = 27.0 \times 10^6\,\text{mm}^4$$',
    'hard',
    ARRAY['textbook-strict', 'hibbeler-f10-8', 'moment-of-inertia'],
    'original',
    'published',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- GET 209 — Topic 1: Limits and Continuity of Functions
-- ---------------------------------------------------------------------
INSERT INTO questions (
  id, course_id, topic_id, question_type, prompt_md, prompt_image_url,
  numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md,
  difficulty, tags, source, status, is_free
) VALUES
  (
    '33333333-3333-4333-8333-000209070001',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222220209',
    'numeric',
    '**[Stewart 7e · §2.3, Example 4]** Consider the piecewise function $g(x)$ graphed in the lower panel of Stewart Figure 2, where $g(x) = \dfrac{x^2 - 1}{x - 1}$ for $x \neq 1$ and $g(1) = 3$. Evaluate $\displaystyle\lim_{x \to 1} g(x)$.',
    '/images/textbook-figures/get-209/stewart-fig-2-3-2-removable-hole.webp',
    2.0,
    0.5,
    '',
    '**Step 1:** The limit as $x \to 1$ depends only on values of $g(x)$ near $1$ ($x \neq 1$), NOT on the isolated dot $g(1) = 3$.\n\n**Step 2:** For $x \neq 1$, $g(x) = \frac{(x-1)(x+1)}{x-1} = x + 1$, so\n$$\lim_{x \to 1} g(x) = \lim_{x \to 1} (x + 1) = 2$$',
    'easy',
    ARRAY['textbook-strict', 'stewart-ex-2-3-4', 'limits'],
    'original',
    'published',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (
  id, course_id, topic_id, question_type, prompt_md, prompt_image_url,
  solution_md, difficulty, tags, source, status, is_free
) VALUES
  (
    '33333333-3333-4333-8333-000209070002',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222220209',
    'mcq',
    '**[Stewart 7e · §2.5, Example 6]** On which largest set of real numbers is the function $f(x) = \dfrac{\ln x + \tan^{-1} x}{x^2 - 1}$ continuous?',
    NULL,
    '**Step 1:** $\ln x$ requires $x > 0$ and $\tan^{-1} x$ is continuous on $(-\infty, \infty)$, so the numerator is continuous on $(0, \infty)$.\n\n**Step 2:** The denominator $x^2 - 1 = 0$ at $x = \pm 1$; excluding $x = 1$ from $(0, \infty)$ yields $(0, 1) \cup (1, \infty)$.',
    'medium',
    ARRAY['textbook-strict', 'stewart-ex-2-5-6', 'continuity'],
    'original',
    'published',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-020907002001', '33333333-3333-4333-8333-000209070002', 'A', '$(0, 1) \cup (1, \infty)$', TRUE, 1),
  ('44444444-4444-4444-8444-020907002002', '33333333-3333-4333-8333-000209070002', 'B', '$(-\infty, -1) \cup (-1, 1) \cup (1, \infty)$', FALSE, 2),
  ('44444444-4444-4444-8444-020907002003', '33333333-3333-4333-8333-000209070002', 'C', '$(0, \infty)$', FALSE, 3),
  ('44444444-4444-4444-8444-020907002004', '33333333-3333-4333-8333-000209070002', 'D', '$[0, 1) \cup (1, \infty)$', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- ---------------------------------------------------------------------
-- GET 209 — Topic 2: First-Order Linear Differential Equations
-- ---------------------------------------------------------------------
INSERT INTO questions (
  id, course_id, topic_id, question_type, prompt_md, prompt_image_url,
  solution_md, difficulty, tags, source, status, is_free
) VALUES
  (
    '33333333-3333-4333-8333-000209070003',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222290002',
    'mcq',
    '**[Stewart 7e · §9.5, Example 1]** Solve the first-order linear differential equation $\dfrac{dy}{dx} + 3x^2 y = 6x^2$, whose solution family for $C = -2, -1, 0, 1, 2$ is shown in the figure.',
    '/images/textbook-figures/get-209/stewart-fig-9-5-1-ode-family.webp',
    '**Step 1:** Integrating factor $I(x) = e^{\int 3x^2\,dx} = e^{x^3}$.\n\n**Step 2:** Multiply through: $\frac{d}{dx}(e^{x^3} y) = 6x^2 e^{x^3} \implies e^{x^3} y = 2e^{x^3} + C$.\n\n**Step 3:** Divide by $e^{x^3}$: $y = 2 + C e^{-x^3}$ (which approaches $2$ as $x \to \infty$, matching the figure!).',
    'medium',
    ARRAY['textbook-strict', 'stewart-ex-9-5-1', 'linear-ode'],
    'original',
    'published',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000209070004',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222290002',
    'mcq',
    '**[Stewart 7e · §9.5, Example 2]** Find the unique solution to the initial-value problem $x^2 y'' + x y = 1$ ($x > 0$) satisfying $y(1) = 2$, graphed in the figure.',
    '/images/textbook-figures/get-209/stewart-fig-9-5-2-ivp-curve.webp',
    '**Step 1:** Divide by $x^2$: $y'' + \frac{1}{x}y = \frac{1}{x^2}$, giving integrating factor $I(x) = e^{\ln x} = x$.\n\n**Step 2:** $(xy)'' = \frac{1}{x} \implies xy = \ln x + C \implies y = \frac{\ln x + C}{x}$.\n\n**Step 3:** Apply $y(1) = 2 \implies C = 2$, so $y(x) = \frac{\ln x + 2}{x}$.',
    'medium',
    ARRAY['textbook-strict', 'stewart-ex-9-5-2', 'ivp'],
    'original',
    'published',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-020907003001', '33333333-3333-4333-8333-000209070003', 'A', '$y = 2 + C e^{-x^3}$', TRUE, 1),
  ('44444444-4444-4444-8444-020907003002', '33333333-3333-4333-8333-000209070003', 'B', '$y = 2e^{x^3} + C$', FALSE, 2),
  ('44444444-4444-4444-8444-020907003003', '33333333-3333-4333-8333-000209070003', 'C', '$y = 6 + C e^{-3x^2}$', FALSE, 3),
  ('44444444-4444-4444-8444-020907003004', '33333333-3333-4333-8333-000209070003', 'D', '$y = 2x^3 + C e^{-x^3}$', FALSE, 4),
  ('44444444-4444-4444-8444-020907004001', '33333333-3333-4333-8333-000209070004', 'A', '$y = \dfrac{\ln x + 2}{x}$', TRUE, 1),
  ('44444444-4444-4444-8444-020907004002', '33333333-3333-4333-8333-000209070004', 'B', '$y = \dfrac{\ln x}{x} + 2$', FALSE, 2),
  ('44444444-4444-4444-8444-020907004003', '33333333-3333-4333-8333-000209070004', 'C', '$y = \dfrac{1 + 2x}{x^2}$', FALSE, 3),
  ('44444444-4444-4444-8444-020907004004', '33333333-3333-4333-8333-000209070004', 'D', '$y = 2e^{-1/x}$', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- ---------------------------------------------------------------------
-- GET 209 — Topic 3: Partial Derivatives, Gradients & Matrices
-- ---------------------------------------------------------------------
INSERT INTO questions (
  id, course_id, topic_id, question_type, prompt_md, prompt_image_url,
  numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md,
  difficulty, tags, source, status, is_free
) VALUES
  (
    '33333333-3333-4333-8333-000209070005',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222290003',
    'numeric',
    '**[Stewart 7e · §14.3, Example 1]** For the surface $f(x, y) = x^3 + x^2 y^3 - 2y^2$, evaluate the first-order partial derivative $f_x(2, 1)$ (the tangent slope along trace $C_1$ shown in the figure).',
    '/images/textbook-figures/get-209/stewart-fig-14-3-1-partial-traces.webp',
    16.0,
    0.5,
    '',
    '**Step 1:** Holding $y$ constant and differentiating with respect to $x$:\n$$f_x(x, y) = 3x^2 + 2x y^3$$\n\n**Step 2:** Substitute $(x, y) = (2, 1)$:\n$$f_x(2, 1) = 3(2)^2 + 2(2)(1)^3 = 12 + 4 = 16$$',
    'easy',
    ARRAY['textbook-strict', 'stewart-ex-14-3-1', 'partial-derivatives'],
    'original',
    'published',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000209070006',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222290003',
    'numeric',
    '**[Stewart 7e · §14.6, Example 4]** Find the directional derivative $D_{\mathbf{u}} f(2, -1)$ of $f(x, y) = x^2 y^3 - 4y$ at $(2, -1)$ in the direction of $\mathbf{v} = 2\mathbf{i} + 5\mathbf{j}$ (shown on the contour plot in the figure). Give your decimal answer to 2 decimal places.',
    '/images/textbook-figures/get-209/stewart-fig-14-6-6-gradient-contour.webp',
    5.94,
    1.0,
    '',
    '**Step 1 (Gradient at $(2, -1)$):**\n$$\nabla f(x, y) = 2x y^3\mathbf{i} + (3x^2 y^2 - 4)\mathbf{j} \implies \nabla f(2, -1) = -4\mathbf{i} + 8\mathbf{j}$$\n\n**Step 2 (Unit direction vector):** $|\mathbf{v}| = \sqrt{2^2 + 5^2} = \sqrt{29}$, so $\mathbf{u} = \frac{2}{\sqrt{29}}\mathbf{i} + \frac{5}{\sqrt{29}}\mathbf{j}$.\n\n**Step 3 (Dot product):**\n$$D_{\mathbf{u}} f(2, -1) = (-4)\!\left(\frac{2}{\sqrt{29}}\right) + 8\!\left(\frac{5}{\sqrt{29}}\right) = \frac{32}{\sqrt{29}} \approx 5.94$$',
    'medium',
    ARRAY['textbook-strict', 'stewart-ex-14-6-4', 'directional-derivative'],
    'original',
    'published',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM questions WHERE id IN (
  '33333333-3333-4333-8333-000205070001',
  '33333333-3333-4333-8333-000205070002',
  '33333333-3333-4333-8333-000205070003',
  '33333333-3333-4333-8333-000205070004',
  '33333333-3333-4333-8333-000205070005',
  '33333333-3333-4333-8333-000205070006',
  '33333333-3333-4333-8333-000207070001',
  '33333333-3333-4333-8333-000207070002',
  '33333333-3333-4333-8333-000207070003',
  '33333333-3333-4333-8333-000207070004',
  '33333333-3333-4333-8333-000207070005',
  '33333333-3333-4333-8333-000207070006',
  '33333333-3333-4333-8333-000209070001',
  '33333333-3333-4333-8333-000209070002',
  '33333333-3333-4333-8333-000209070003',
  '33333333-3333-4333-8333-000209070004',
  '33333333-3333-4333-8333-000209070005',
  '33333333-3333-4333-8333-000209070006'
);
-- +goose StatementEnd

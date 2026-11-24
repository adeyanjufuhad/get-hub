-- +goose Up
-- +goose StatementBegin

-- =====================================================================
-- Additional Textbook-Inspired Original Practice Questions (GET 205/207/209)
-- Modeled on OAU Part 2 textbook chapters (Cengel, Beer & Johnston, Hibbeler,
-- James Stewart, Schaum's Linear Algebra & Vector Analysis) with original
-- wording and freshly computed numbers.
-- =====================================================================

-- GET 205 Q6 (Numeric — Inspired by Cengel & Cimbala Ch. 3)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000205006',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222220205',
    'numeric',
    'A vertical rectangular sluice gate $2.0\,\text{m}$ wide and $3.0\,\text{m}$ tall holds fresh water ($\rho = 1000\,\text{kg/m}^3$, $g = 9.81\,\text{m/s}^2$) right up to its top edge. Calculate the total resultant hydrostatic force $F_R$ acting on the gate in $\text{kN}$.',
    88.29,
    1.0,
    'kN',
    '**Step 1:** Locate the centroid depth $h_c$ of the vertical rectangle from the free surface:\n$$h_c = \frac{H}{2} = \frac{3.0}{2} = 1.5\,\text{m}$$\n\n**Step 2:** Compute the submerged area $A = 2.0 \times 3.0 = 6.0\,\text{m}^2$.\n\n**Step 3:** Apply $F_R = \rho g h_c A$:\n$$F_R = 1000 \times 9.81 \times 1.5 \times 6.0 = 88\,290\,\text{N} = 88.29\,\text{kN}$$',
    'medium',
    ARRAY['submerged-surfaces', 'hydrostatic-force', 'cengel-ch3'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- GET 205 Q7 (Numeric — Inspired by Munson Ch. 2 Manometry)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000205007',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222220205',
    'numeric',
    'A U-tube manometer containing mercury ($SG = 13.6$) is connected to a water pipe ($SG = 1.0$). The water–mercury interface in the left leg lies $0.25\,\text{m}$ below the pipe centre, while the mercury column in the open right leg rises $0.40\,\text{m}$ above that interface. Taking $g = 9.81\,\text{m/s}^2$, find the gauge pressure $P_A$ in the pipe (in $\text{kPa}$).',
    50.91,
    1.0,
    'kPa',
    '**Step 1:** Equate pressures along the horizontal datum through the water–mercury interface:\n$$P_A + \rho_w g h_1 = \rho_{\text{Hg}} g h_2$$\n\n**Step 2:** Substitute $\rho_w = 1000\,\text{kg/m}^3$, $\rho_{\text{Hg}} = 13\,600\,\text{kg/m}^3$, $h_1 = 0.25\,\text{m}$, $h_2 = 0.40\,\text{m}$:\n$$P_A = 13\,600(9.81)(0.40) - 1000(9.81)(0.25) = 53\,366.4 - 2452.5 = 50\,913.9\,\text{Pa} \approx 50.91\,\text{kPa}$$',
    'medium',
    ARRAY['manometry', 'mercury', 'munson-ch2'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- GET 205 Q8 (MCQ — Inspired by Cengel Ch. 3 Centre of Pressure)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000205008',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222220205',
    'mcq',
    'A vertical rectangular dam gate of height $H$ has its top edge flush with the free surface of water. At what depth below the free surface does the resultant hydrostatic force act (the **centre of pressure** $y_p$)?',
    '**Step 1:** Hydrostatic pressure increases linearly from $0$ at the surface to $\rho g H$ at the bottom, forming a triangular pressure prism.\n\n**Step 2:** The centroid of a triangle measured from its apex (the free surface) lies at $y_p = \frac{2}{3}H$.',
    'easy',
    ARRAY['centre-of-pressure', 'hydrostatics', 'cengel-ch3'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-000205008001', '33333333-3333-4333-8333-000000205008', 'A', '$\frac{1}{3}H$', FALSE, 1),
  ('44444444-4444-4444-8444-000205008002', '33333333-3333-4333-8333-000000205008', 'B', '$\frac{1}{2}H$', FALSE, 2),
  ('44444444-4444-4444-8444-000205008003', '33333333-3333-4333-8333-000000205008', 'C', '$\frac{2}{3}H$', TRUE, 3),
  ('44444444-4444-4444-8444-000205008004', '33333333-3333-4333-8333-000000205008', 'D', '$\frac{3}{4}H$', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- GET 207 Q6 (Numeric — Inspired by Beer & Johnston 10th Ed. Ch. 2)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000207006',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222220207',
    'numeric',
    'A workshop light fixture of weight $W = 150\,\text{N}$ is suspended symmetrically by two cables $AC$ and $BC$, each inclined at $30^\circ$ above the horizontal. Calculate the tension $T$ in each cable (in Newtons).',
    150.0,
    1.0,
    'N',
    '**Step 1:** By symmetry, both cables carry the same tension $T$.\n\n**Step 2:** Apply vertical equilibrium at the hanging joint $C$:\n$$\sum F_y = 0 \implies T\sin 30^\circ + T\sin 30^\circ - 150 = 0$$\n\n**Step 3:** Since $\sin 30^\circ = 0.5$:\n$$2T(0.5) = 150 \implies T = 150\,\text{N}$$',
    'easy',
    ARRAY['particle-equilibrium', 'cables', 'beer-johnston-ch2'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- GET 207 Q7 (Numeric — Inspired by Hibbeler 14th Ed. Ch. 4 Vector Moment)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000207007',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222220207',
    'numeric',
    'A coplanar force $\vec{F} = (40\hat{i} + 30\hat{j})\,\text{N}$ acts at a bracket point with position vector $\vec{r} = (0.5\hat{i} + 0.2\hat{j})\,\text{m}$ from pivot $O$. Compute the $z$-component of the moment $M_O = (\vec{r} \times \vec{F})_z$ in $\text{N}\cdot\text{m}$.',
    7.0,
    1.0,
    'N·m',
    '**Step 1:** Recall the 2D cross-product moment formula:\n$$M_z = r_x F_y - r_y F_x$$\n\n**Step 2:** Substitute $r_x = 0.5$, $r_y = 0.2$, $F_x = 40$, $F_y = 30$:\n$$M_z = (0.5)(30) - (0.2)(40) = 15 - 8 = 7.0\,\text{N}\cdot\text{m}$$ (anticlockwise).',
    'medium',
    ARRAY['cross-product', 'moments', 'hibbeler-ch4'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- GET 207 Q8 (Numeric — Inspired by Beer & Johnston Ch. 4 Overhanging Beam)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000207008',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222220207',
    'numeric',
    'A light horizontal beam $AB$ of total length $5.0\,\text{m}$ is supported by a pin at $A$ and a roller at $C$ located $4.0\,\text{m}$ from $A$ (leaving a $1.0\,\text{m}$ overhang $CB$). A single downward load of $200\,\text{N}$ acts at the free end $B$. Find the upward reaction $R_C$ at roller $C$ (in Newtons).',
    250.0,
    1.0,
    'N',
    '**Step 1:** Take moments about pin $A$ ($+$ anticlockwise) to eliminate $R_A$:\n$$\sum M_A = 0 \implies R_C(4.0) - 200(5.0) = 0$$\n\n**Step 2:** Solve for $R_C$:\n$$R_C = \frac{1000}{4.0} = 250\,\text{N}$$\n*(Notice $R_C$ exceeds the load because pin $A$ must pull downward with $50\,\text{N}$ to stop the overhang from tipping.)*',
    'hard',
    ARRAY['overhanging-beam', 'reactions', 'beer-johnston-ch4'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- GET 209 Q6 (Numeric — Inspired by James Stewart 7th Ed. Ch. 2)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000209006',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222220209',
    'numeric',
    'Evaluate the limit by rationalizing the numerator (enter as a decimal):\n$$\lim_{x \to 4} \frac{\sqrt{x} - 2}{x - 4}$$',
    0.25,
    1.0,
    '',
    '**Step 1:** Direct substitution gives $\frac{0}{0}$. Multiply numerator and denominator by the conjugate $(\sqrt{x} + 2)$:\n$$\frac{(\sqrt{x} - 2)(\sqrt{x} + 2)}{(x - 4)(\sqrt{x} + 2)} = \frac{x - 4}{(x - 4)(\sqrt{x} + 2)}$$\n\n**Step 2:** Cancel $(x - 4)$ and substitute $x = 4$:\n$$\lim_{x \to 4} \frac{1}{\sqrt{x} + 2} = \frac{1}{2 + 2} = \frac{1}{4} = 0.25$$',
    'medium',
    ARRAY['limits', 'conjugate', 'stewart-ch2'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- GET 209 Q7 (Numeric — Inspired by Schaum's Linear Algebra 4th Ed. Ch. 8)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000209007',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222220209',
    'numeric',
    'Compute the determinant of the $2 \times 2$ matrix:\n$$A = \begin{pmatrix} 7 & 4 \\ 3 & 5 \end{pmatrix}$$',
    23.0,
    1.0,
    '',
    '**Step 1:** For a $2 \times 2$ matrix $\begin{pmatrix} a & b \\ c & d \end{pmatrix}$, the determinant is $\det(A) = ad - bc$.\n\n**Step 2:** Substitute values:\n$$\det(A) = (7)(5) - (4)(3) = 35 - 12 = 23$$',
    'easy',
    ARRAY['matrices', 'determinants', 'schaums-linalg'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- GET 209 Q8 (Numeric — Inspired by Schaum's Vector Analysis Ch. 1)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000209008',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222220209',
    'numeric',
    'Given $\vec{u} = 3\hat{i} - 2\hat{j} + 4\hat{k}$ and $\vec{v} = 2\hat{i} + 5\hat{j} - \hat{k}$, compute the dot product $\vec{u} \cdot \vec{v}$.',
    -8.0,
    1.0,
    '',
    '**Step 1:** Multiply matching components and sum:\n$$\vec{u} \cdot \vec{v} = u_x v_x + u_y v_y + u_z v_z$$\n\n**Step 2:** Evaluate:\n$$(3)(2) + (-2)(5) + (4)(-1) = 6 - 10 - 4 = -8$$',
    'easy',
    ARRAY['vectors', 'dot-product', 'schaums-vector'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM questions WHERE id IN (
  '33333333-3333-4333-8333-000000205006',
  '33333333-3333-4333-8333-000000205007',
  '33333333-3333-4333-8333-000000205008',
  '33333333-3333-4333-8333-000000207006',
  '33333333-3333-4333-8333-000000207007',
  '33333333-3333-4333-8333-000000207008',
  '33333333-3333-4333-8333-000000209006',
  '33333333-3333-4333-8333-000000209007',
  '33333333-3333-4333-8333-000000209008'
);
-- +goose StatementEnd

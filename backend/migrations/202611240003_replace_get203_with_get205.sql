-- +goose Up
-- +goose StatementBegin

-- Remove unconfirmed GET 203 course and its cascaded seed content
DELETE FROM courses WHERE slug = 'get-203';

-- Seed GET 205 (Fundamentals of Fluid Mechanics) as display_order = 1
INSERT INTO courses (id, code, slug, title, description, display_order, is_active) VALUES
  (
    '11111111-1111-4111-8111-111111111205',
    'GET 205',
    'get-205',
    'Fundamentals of Fluid Mechanics',
    'Fluid properties, hydrostatics, manometry, forces on submerged surfaces, buoyancy & stability, continuity, Bernoulli''s equation, pipe flow measurements, and dimensional analysis.',
    1,
    TRUE
  )
ON CONFLICT (slug) DO UPDATE SET
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Seed 1 Original Draft Sample Topic for GET 205
INSERT INTO topics (id, course_id, slug, title, display_order, ccmas_ref, outcomes, status, is_free) VALUES
  (
    '22222222-2222-4222-8222-222222220205',
    '11111111-1111-4111-8111-111111111205',
    'fluid-properties-and-hydrostatics',
    'Fluid Properties, Hydrostatic Pressure & Manometry',
    1,
    'Fluid properties; hydrostatics, pressure measurement & forces on submerged surfaces',
    '["Calculate fluid density, specific weight, specific gravity, and shear stress from Newton''s law of viscosity", "Apply the hydrostatic pressure law and U-tube manometry to solve for unknown gauge pressures", "Determine the magnitude and centre of pressure of hydrostatic forces on vertical submerged surfaces"]'::jsonb,
    'draft',
    TRUE
  )
ON CONFLICT (course_id, slug) DO NOTHING;

-- =====================================================================
-- GET 205 — 5 Original Draft Questions (Fluid Properties & Hydrostatics)
-- =====================================================================

-- Q1 (GET 205, Diagram MCQ)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, prompt_image_url, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000205001',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222220205',
    'mcq',
    'In the U-tube manometer shown, a fluid of density $\rho_1$ in pipe $A$ meets a heavier manometer fluid of density $\rho_2$ ($\rho_2 > \rho_1$). Line $Z\text{–}Z$ passes horizontally through the lower meniscus in the continuous manometer fluid, and the right leg is open to atmosphere. Which expression gives the **gauge pressure** $P_A$ at the centre of pipe $A$?',
    '/diagrams/get-205/u-tube-manometer.svg',
    '**Step 1:** By Pascal''s law, pressures at the same horizontal datum $Z\text{–}Z$ inside the continuous manometer fluid are equal: $P_{Z,\text{left}} = P_{Z,\text{right}}$.\n\n**Step 2:** Moving downward from pipe $A$ to $Z\text{–}Z$ adds hydrostatic pressure: $P_{Z,\text{left}} = P_A + \rho_1 g h_1$.\n\n**Step 3:** On the right leg (open to atmosphere, $P_{\text{atm,gauge}} = 0$), $P_{Z,\text{right}} = \rho_2 g h_2$.\n\n**Step 4:** Equating gives $P_A + \rho_1 g h_1 = \rho_2 g h_2 \implies P_A = \rho_2 g h_2 - \rho_1 g h_1$.',
    'easy',
    ARRAY['manometry', 'hydrostatics', 'pascals-law'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-000205001001', '33333333-3333-4333-8333-000000205001', 'A', '$P_A = \rho_2 g h_2 - \rho_1 g h_1$', TRUE, 1),
  ('44444444-4444-4444-8444-000205001002', '33333333-3333-4333-8333-000000205001', 'B', '$P_A = \rho_2 g h_2 + \rho_1 g h_1$', FALSE, 2),
  ('44444444-4444-4444-8444-000205001003', '33333333-3333-4333-8333-000000205001', 'C', '$P_A = \rho_1 g h_2 - \rho_2 g h_1$', FALSE, 3),
  ('44444444-4444-4444-8444-000205001004', '33333333-3333-4333-8333-000000205001', 'D', '$P_A = \rho_2 g (h_2 - h_1)$', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- Q2 (GET 205, Numeric)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000205002',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222220205',
    'numeric',
    'An open tank holds lubricating oil with specific gravity $SG = 0.85$. Taking $\rho_w = 1000\,\text{kg/m}^3$ and $g = 9.81\,\text{m/s}^2$, calculate the **gauge pressure** in $\text{kPa}$ at a depth of $4.0\,\text{m}$ below the free surface.',
    33.35,
    1.0,
    'kPa',
    '**Step 1:** Find the oil density from its specific gravity:\n$$\rho_{\text{oil}} = SG \times \rho_w = 0.85 \times 1000 = 850\,\text{kg/m}^3$$\n\n**Step 2:** Apply the hydrostatic pressure formula:\n$$P = \rho_{\text{oil}} g h = 850 \times 9.81 \times 4.0 = 33\,354\,\text{Pa} \approx 33.35\,\text{kPa}$$',
    'easy',
    ARRAY['specific-gravity', 'hydrostatic-pressure'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- Q3 (GET 205, MCQ)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000205003',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222220205',
    'mcq',
    'Which statement correctly defines a **Newtonian fluid** under laminar shear flow?',
    '**Step 1:** Newton''s law of viscosity states $\tau = \mu \frac{du}{dy}$.\n\n**Step 2:** A fluid is **Newtonian** when the shear stress $\tau$ is directly proportional to the velocity gradient (shear strain rate) $\frac{du}{dy}$, so the dynamic viscosity $\mu$ remains constant at a given temperature and pressure.',
    'easy',
    ARRAY['viscosity', 'newtonian-fluid'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-000205003001', '33333333-3333-4333-8333-000000205003', 'A', 'Shear stress $\tau$ is directly proportional to the velocity gradient $\frac{du}{dy}$ with constant $\mu$.', TRUE, 1),
  ('44444444-4444-4444-8444-000205003002', '33333333-3333-4333-8333-000000205003', 'B', 'Shear stress $\tau$ is proportional to $\left(\frac{du}{dy}\right)^2$.', FALSE, 2),
  ('44444444-4444-4444-8444-000205003003', '33333333-3333-4333-8333-000000205003', 'C', 'The fluid resists small static shear stresses without deforming.', FALSE, 3),
  ('44444444-4444-4444-8444-000205003004', '33333333-3333-4333-8333-000000205003', 'D', 'Dynamic viscosity $\mu$ is identically zero at all speeds.', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- Q4 (GET 205, Numeric)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000205004',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222220205',
    'numeric',
    'A thin film of SAE oil ($\mu = 0.30\,\text{Pa}\cdot\text{s}$) of thickness $2.0\,\text{mm}$ lies between a fixed bottom plate and an upper plate moving at $1.6\,\text{m/s}$. Assuming a linear velocity profile, calculate the **shear stress** $\tau$ on the upper plate in Pascals ($\text{Pa}$).',
    240.0,
    1.0,
    'Pa',
    '**Step 1:** Convert the film thickness to metres:\n$$y = 2.0\,\text{mm} = 2.0 \times 10^{-3}\,\text{m}$$\n\n**Step 2:** Apply Newton''s law of viscosity for a linear velocity gradient:\n$$\tau = \mu \frac{U}{y} = 0.30 \times \frac{1.6}{2.0 \times 10^{-3}} = 0.30 \times 800 = 240\,\text{Pa}$$',
    'medium',
    ARRAY['viscosity', 'shear-stress'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- Q5 (GET 205, Diagram Numeric)
INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, prompt_image_url, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000000205005',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222220205',
    'numeric',
    'A vertical rectangular sluice gate of width $2.5\,\text{m}$ and height $H = 4.0\,\text{m}$ retains fresh water ($\rho = 1000\,\text{kg/m}^3$) flush with its top edge at the free surface. Taking $g = 9.81\,\text{m/s}^2$, calculate the **total hydrostatic force** $F_R$ on the gate in kilonewtons ($\text{kN}$).',
    '/diagrams/get-205/hydrostatic-pressure-prism.svg',
    196.2,
    1.0,
    'kN',
    '**Step 1:** Compute the submerged area $A$ and centroid depth $\bar{h}$:\n$$A = b \times H = 2.5 \times 4.0 = 10.0\,\text{m}^2, \qquad \bar{h} = \frac{H}{2} = 2.0\,\text{m}$$\n\n**Step 2:** Compute the resultant hydrostatic force:\n$$F_R = \rho g \bar{h} A = 1000 \times 9.81 \times 2.0 \times 10.0 = 196\,200\,\text{N} = 196.2\,\text{kN}$$',
    'medium',
    ARRAY['submerged-surface', 'hydrostatic-force'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM questions WHERE id::text LIKE '33333333-3333-4333-8333-000000205%';
DELETE FROM topics WHERE id = '22222222-2222-4222-8222-222222220205';
DELETE FROM courses WHERE id = '11111111-1111-4111-8111-111111111205';
-- +goose StatementEnd

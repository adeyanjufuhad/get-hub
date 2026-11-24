-- +goose Up
-- +goose StatementBegin

-- =====================================================================
-- Expand GET 205, GET 207, and GET 209 with 6 new CCMAS study topics
-- and 30 original math-verified practice questions (5 per new topic).
-- =====================================================================

-- 1. Seed 6 New Topics (2 per course)
INSERT INTO topics (id, course_id, slug, title, display_order, ccmas_ref, outcomes, status, is_free) VALUES
  (
    '22222222-2222-4222-8222-222222250002',
    '11111111-1111-4111-8111-111111111205',
    'buoyancy-and-stability',
    'Buoyancy, Archimedes'' Principle & Stability of Floating Bodies',
    2,
    'Buoyancy, Archimedes'' principle & stability of floating and submerged bodies',
    '["Calculate buoyant force and submerged volume fraction for floating and submerged bodies", "Locate centre of buoyancy (B), centre of gravity (G), and metacentre (M)", "Evaluate rotational stability using metacentric height GM = BM - BG"]'::jsonb,
    'draft',
    TRUE
  ),
  (
    '22222222-2222-4222-8222-222222250003',
    '11111111-1111-4111-8111-111111111205',
    'continuity-and-bernoulli',
    'Continuity, Bernoulli''s Equation & Flow Measurement',
    3,
    'Control-volume continuity; Bernoulli''s equation, Venturi meters & Pitot tubes',
    '["Apply conservation of mass (continuity) to converging/diverging pipes", "Apply Bernoulli''s equation in pressure form and head form with valid assumptions", "Compute jet speed, Venturi discharge, and Pitot-static velocity"]'::jsonb,
    'draft',
    TRUE
  ),
  (
    '22222222-2222-4222-8222-222222270002',
    '11111111-1111-4111-8111-111111111207',
    'dry-friction-and-inclines',
    'Dry Friction on Inclined Planes, Ladders & Wedges',
    2,
    'Friction on inclined planes, ladders & wedges',
    '["Distinguish static friction, impending motion, and kinetic friction", "Solve equilibrium problems for blocks on rough inclined planes", "Determine angle of repose and impending slip vs. rest conditions"]'::jsonb,
    'draft',
    TRUE
  ),
  (
    '22222222-2222-4222-8222-222222270003',
    '11111111-1111-4111-8111-111111111207',
    'centroids-and-second-moments',
    'Centroids, First & Second Moments of Area',
    3,
    'Centroids, first & second moments of area',
    '["Locate the centroid of composite structural sections using tabular summation", "Compute second moment of area I_x and radius of gyration k_x", "Apply the Parallel-Axis Theorem I = I_c + A d^2"]'::jsonb,
    'draft',
    TRUE
  ),
  (
    '22222222-2222-4222-8222-222222290002',
    '11111111-1111-4111-8111-111111111209',
    'first-order-linear-odes',
    'First-Order Linear Differential Equations',
    2,
    'Linear first-order differential equations',
    '["Convert first-order linear ODEs into standard form dy/dx + P(x)y = Q(x)", "Compute the integrating factor μ(x) = exp(∫ P(x) dx)", "Solve initial value problems for constant and variable coefficients"]'::jsonb,
    'draft',
    TRUE
  ),
  (
    '22222222-2222-4222-8222-222222290003',
    '11111111-1111-4111-8111-111111111209',
    'partial-derivatives-and-matrices',
    'Partial Derivatives, Gradients & Matrices',
    3,
    'Partial & total derivatives; directional derivatives & gradients; matrices & determinants',
    '["Compute partial derivatives and total differentials for multivariable functions", "Evaluate gradients ∇f and directional derivatives D_u f", "Compute 2×2 and 3×3 determinants and identify singular matrices"]'::jsonb,
    'draft',
    TRUE
  )
ON CONFLICT (course_id, slug) DO NOTHING;

-- =====================================================================
-- GET 205 Topic 2: Buoyancy & Stability (5 Questions)
-- =====================================================================

INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000205020001',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222250002',
    'mcq',
    'For a **floating body** (such as a rectangular barge) to be in **stable rotational equilibrium**, what condition must its metacentre $M$ and centre of gravity $G$ satisfy?',
    '**Step 1:** When a floating body tilts slightly, the centre of buoyancy shifts laterally toward the dipped side.\n\n**Step 2:** A restoring couple forms only when the metacentre $M$ lies **above** the centre of gravity $G$, giving a positive metacentric height $GM = BM - BG > 0$.',
    'easy',
    ARRAY['buoyancy', 'stability', 'metacentre'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-020502001001', '33333333-3333-4333-8333-000205020001', 'A', 'Metacentre $M$ lies above $G$ ($GM > 0$).', TRUE, 1),
  ('44444444-4444-4444-8444-020502001002', '33333333-3333-4333-8333-000205020001', 'B', 'Metacentre $M$ lies below $G$ ($GM < 0$).', FALSE, 2),
  ('44444444-4444-4444-8444-020502001003', '33333333-3333-4333-8333-000205020001', 'C', 'Centre of gravity $G$ must always lie below the waterline.', FALSE, 3),
  ('44444444-4444-4444-8444-020502001004', '33333333-3333-4333-8333-000205020001', 'D', 'Centre of buoyancy $B$ must coincide with $G$.', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000205020002',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222250002',
    'numeric',
    'A uniform rectangular timber block of specific gravity $SG = 0.65$ and total height $H = 0.80\,\text{m}$ floats upright in fresh water ($SG = 1.0$). Calculate its submerged draft depth $d$ in metres.',
    0.52,
    1.0,
    'm',
    '**Step 1:** For a uniform prism floating upright, the submerged fraction equals the density ratio:\n$$\frac{d}{H} = \frac{SG_{\text{block}}}{SG_{\text{water}}}$$\n\n**Step 2:** Multiply through by $H = 0.80\,\text{m}$:\n$$d = 0.65 \times 0.80 = 0.52\,\text{m}$$',
    'easy',
    ARRAY['buoyancy', 'archimedes', 'draft'],
    'original',
    'draft',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000205020003',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222250002',
    'numeric',
    'A solid steel sensor housing of volume $V = 0.020\,\text{m}^3$ is completely submerged in seawater ($\rho = 1025\,\text{kg/m}^3$, $g = 9.81\,\text{m/s}^2$). Calculate the upward buoyant force $F_B$ in Newtons.',
    201.11,
    1.0,
    'N',
    '**Step 1:** Apply Archimedes'' principle with the **fluid** density $\rho = 1025\,\text{kg/m}^3$:\n$$F_B = \rho g V$$\n\n**Step 2:** Substitute values:\n$$F_B = 1025 \times 9.81 \times 0.020 = 201.105\,\text{N} \approx 201.11\,\text{N}$$',
    'easy',
    ARRAY['archimedes', 'buoyant-force'],
    'original',
    'draft',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000205020004',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222250002',
    'numeric',
    'A flat-bottomed rectangular barge of length $L = 8.0\,\text{m}$ and width $b = 4.0\,\text{m}$ floats in water at a draft of $d = 1.0\,\text{m}$. Calculate its minimum metacentric radius $BM = I_{\min}/V_{\text{sub}}$ in metres.',
    1.33,
    1.5,
    'm',
    '**Step 1:** Compute submerged volume:\n$$V_{\text{sub}} = L \cdot b \cdot d = 8.0 \times 4.0 \times 1.0 = 32.0\,\text{m}^3$$\n\n**Step 2:** Compute minimum waterplane second moment of area (rolling about the long axis):\n$$I_{\min} = \frac{L b^3}{12} = \frac{8.0 \times 4.0^3}{12} = \frac{512}{12} = 42.67\,\text{m}^4$$\n\n**Step 3:** Divide to find $BM$:\n$$BM = \frac{42.67}{32.0} = 1.333\,\text{m} \approx 1.33\,\text{m}$$',
    'medium',
    ARRAY['metacentric-radius', 'stability', 'cengel-ch3'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000205020005',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222250002',
    'mcq',
    'For a **completely submerged** rigid body (such as a deep-sea ROV or submarine), rotational stability requires:',
    '**Step 1:** Because a fully submerged body has no waterline wedge shift, the centre of buoyancy $B$ remains fixed relative to the hull during a tilt.\n\n**Step 2:** Therefore a restoring couple is produced only if the centre of gravity $G$ lies **below** the centre of buoyancy $B$.',
    'easy',
    ARRAY['submerged-stability', 'buoyancy'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-020502005001', '33333333-3333-4333-8333-000205020005', 'A', 'Centre of gravity $G$ lies below centre of buoyancy $B$.', TRUE, 1),
  ('44444444-4444-4444-8444-020502005002', '33333333-3333-4333-8333-000205020005', 'B', 'Centre of gravity $G$ lies above centre of buoyancy $B$.', FALSE, 2),
  ('44444444-4444-4444-8444-020502005003', '33333333-3333-4333-8333-000205020005', 'C', 'Waterplane moment of inertia $I_{\min}$ must be maximized.', FALSE, 3),
  ('44444444-4444-4444-8444-020502005004', '33333333-3333-4333-8333-000205020005', 'D', 'Body density must be less than fluid density.', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- =====================================================================
-- GET 205 Topic 3: Continuity & Bernoulli's Equation (5 Questions)
-- =====================================================================

INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000205030001',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222250003',
    'numeric',
    'Water flows steadily at $V_1 = 1.5\,\text{m/s}$ through a circular pipe of diameter $D_1 = 0.24\,\text{m}$ that smoothly narrows to $D_2 = 0.12\,\text{m}$. Calculate the average velocity $V_2$ in the narrower section (in $\text{m/s}$).',
    6.0,
    1.0,
    'm/s',
    '**Step 1:** By steady incompressible continuity, $A_1 V_1 = A_2 V_2$:\n$$V_2 = V_1 \left(\frac{D_1}{D_2}\right)^2$$\n\n**Step 2:** Substitute $D_1/D_2 = 0.24/0.12 = 2$:\n$$V_2 = 1.5 \times 2^2 = 1.5 \times 4 = 6.0\,\text{m/s}$$',
    'easy',
    ARRAY['continuity', 'pipe-flow'],
    'original',
    'draft',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000205030002',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222250003',
    'numeric',
    'Water ($\rho = 1000\,\text{kg/m}^3$) flows frictionlessly through a horizontal reducer. At section 1, $P_1 = 140\,\text{kPa}$ and $V_1 = 2.0\,\text{m/s}$. At the narrower section 2, $V_2 = 6.0\,\text{m/s}$. Find the static pressure $P_2$ in $\text{kPa}$.',
    124.0,
    1.0,
    'kPa',
    '**Step 1:** Horizontal Bernoulli ($z_1 = z_2$):\n$$P_2 = P_1 + \frac{1}{2}\rho\left(V_1^2 - V_2^2\right)$$\n\n**Step 2:** Convert $P_1 = 140\,000\,\text{Pa}$ and evaluate:\n$$P_2 = 140\,000 + 500(4 - 36) = 140\,000 - 16\,000 = 124\,000\,\text{Pa} = 124\,\text{kPa}$$',
    'medium',
    ARRAY['bernoulli', 'pressure-drop'],
    'original',
    'draft',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000205030003',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222250003',
    'numeric',
    'A large open water tank has a small smooth nozzle located $4.0\,\text{m}$ below the free water surface. Taking $g = 9.81\,\text{m/s}^2$, use Torricelli''s theorem to compute the ideal jet exit velocity in $\text{m/s}$.',
    8.86,
    1.0,
    'm/s',
    '**Step 1:** Applying Bernoulli between the large free surface ($V_1 \approx 0$) and the open jet ($P_1 = P_2 = P_{\text{atm}}$) gives:\n$$V = \sqrt{2gh}$$\n\n**Step 2:** Evaluate:\n$$V = \sqrt{2 \times 9.81 \times 4.0} = \sqrt{78.48} \approx 8.86\,\text{m/s}$$',
    'easy',
    ARRAY['torricelli', 'bernoulli'],
    'original',
    'draft',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000205030004',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222250003',
    'numeric',
    'A Pitot-static tube placed in a wind tunnel with air density $\rho = 1.20\,\text{kg/m}^3$ measures a stagnation-to-static pressure difference $\Delta P = 540\,\text{Pa}$. Compute the free-stream airspeed $V$ in $\text{m/s}$.',
    30.0,
    1.0,
    'm/s',
    '**Step 1:** Dynamic pressure equals $\Delta P = \frac{1}{2}\rho V^2$, so:\n$$V = \sqrt{\frac{2\Delta P}{\rho}}$$\n\n**Step 2:** Substitute $\Delta P = 540\,\text{Pa}$ and $\rho = 1.20\,\text{kg/m}^3$:\n$$V = \sqrt{\frac{1080}{1.20}} = \sqrt{900} = 30.0\,\text{m/s}$$',
    'medium',
    ARRAY['pitot-tube', 'flow-measurement'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000205030005',
    '11111111-1111-4111-8111-111111111205',
    '22222222-2222-4222-8222-222222250003',
    'mcq',
    'Which of the following is **NOT** a valid assumption of the standard Bernoulli equation $P + \frac{1}{2}\rho V^2 + \rho gz = \text{constant}$?',
    '**Step 1:** Standard Bernoulli''s equation requires: steady flow, incompressible fluid, **inviscid (frictionless)** flow, and evaluation along a streamline.\n\n**Step 2:** Including viscous wall friction violates standard Bernoulli—you must switch to the extended Energy Equation with a head-loss term $h_L$.',
    'easy',
    ARRAY['bernoulli-assumptions', 'theory'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-020503005001', '33333333-3333-4333-8333-000205030005', 'A', 'Steady flow (no time dependence).', FALSE, 1),
  ('44444444-4444-4444-8444-020503005002', '33333333-3333-4333-8333-000205030005', 'B', 'Incompressible fluid (constant density $\rho$).', FALSE, 2),
  ('44444444-4444-4444-8444-020503005003', '33333333-3333-4333-8333-000205030005', 'C', 'Significant viscous pipe friction losses included.', TRUE, 3),
  ('44444444-4444-4444-8444-020503005004', '33333333-3333-4333-8333-000205030005', 'D', 'Applied along a single streamline.', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- =====================================================================
-- GET 207 Topic 2: Dry Friction on Inclined Planes (5 Questions)
-- =====================================================================

INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000207020001',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222270002',
    'numeric',
    'A $300\,\text{N}$ toolbox sits at rest on a rough horizontal bench ($\mu_s = 0.35$, $\mu_k = 0.25$). A horizontal pull of $80\,\text{N}$ is applied. What is the **actual friction force** $F$ developed between the box and the bench (in Newtons)?',
    80.0,
    1.0,
    'N',
    '**Step 1:** Maximum static friction available is $F_{\max} = \mu_s N = 0.35 \times 300 = 105\,\text{N}$.\n\n**Step 2:** Since the applied pull $80\,\text{N} < 105\,\text{N}$, the box does **not** slip.\n\n**Step 3:** By horizontal equilibrium, $F = 80.0\,\text{N}$.',
    'easy',
    ARRAY['static-friction', 'equilibrium', 'beer-johnston-ch8'],
    'original',
    'draft',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000207020002',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222270002',
    'numeric',
    'A steel block rests on an adjustable inclined ramp with coefficient of static friction $\mu_s = 0.5774$. Calculate the **angle of repose** $\theta_s$ (in degrees) at which the block just begins to slide down under its own weight.',
    30.0,
    1.5,
    'deg',
    '**Step 1:** At impending slip down a ramp with no external forces, $\tan\theta_s = \mu_s$.\n\n**Step 2:** Evaluate:\n$$\theta_s = \arctan(0.5774) = 30.0^\circ$$',
    'easy',
    ARRAY['angle-of-repose', 'inclined-plane'],
    'original',
    'draft',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000207020003',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222270002',
    'numeric',
    'A $400\,\text{N}$ crate rests on a rough ramp inclined at $30^\circ$ to the horizontal ($\mu_s = 0.20$). Find the minimum force $P$ applied **parallel and up** the ramp needed to initiate upward motion (in Newtons).',
    269.28,
    1.0,
    'N',
    '**Step 1:** Normal reaction perpendicular to the ramp:\n$$N = W\cos 30^\circ = 400(0.8660) = 346.41\,\text{N}$$\n\n**Step 2:** Limiting friction acts **down** the ramp:\n$$F_{\max} = 0.20 \times 346.41 = 69.28\,\text{N}$$\n\n**Step 3:** Parallel equilibrium:\n$$P = W\sin 30^\circ + F_{\max} = 200 + 69.28 = 269.28\,\text{N}$$',
    'medium',
    ARRAY['inclined-plane', 'impending-motion', 'hibbeler-ch8'],
    'original',
    'draft',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000207020004',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222270002',
    'numeric',
    'For the same $400\,\text{N}$ crate on a $30^\circ$ ramp ($\mu_s = 0.20$), calculate the **minimum** force $P$ applied parallel up the ramp just to prevent it from sliding **down** (in Newtons).',
    130.72,
    1.0,
    'N',
    '**Step 1:** Because impending motion is **down** the ramp, friction helps hold the crate by acting **up** the ramp ($F_{\max} = 69.28\,\text{N}$).\n\n**Step 2:** Parallel equilibrium:\n$$P + F_{\max} = W\sin 30^\circ \implies P = 200 - 69.28 = 130.72\,\text{N}$$',
    'medium',
    ARRAY['inclined-plane', 'friction-direction'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000207020005',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222270002',
    'mcq',
    'Once a block overcomes static friction and begins sliding across a dry surface, which statement accurately describes the friction force?',
    '**Step 1:** During sliding, Coulomb friction is governed by the kinetic coefficient $\mu_k$, which is normally **smaller** than the static coefficient $\mu_s$.\n\n**Step 2:** Therefore $F_k = \mu_k N < \mu_s N$.',
    'easy',
    ARRAY['kinetic-friction', 'coulomb-law'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-020702005001', '33333333-3333-4333-8333-000207020005', 'A', 'It equals $F_k = \mu_k N$, which is typically smaller than the peak static friction $\mu_s N$.', TRUE, 1),
  ('44444444-4444-4444-8444-020702005002', '33333333-3333-4333-8333-000207020005', 'B', 'It increases linearly with sliding velocity.', FALSE, 2),
  ('44444444-4444-4444-8444-020702005003', '33333333-3333-4333-8333-000207020005', 'C', 'It depends strongly on the nominal contact area.', FALSE, 3),
  ('44444444-4444-4444-8444-020702005004', '33333333-3333-4333-8333-000207020005', 'D', 'It immediately drops to zero.', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- =====================================================================
-- GET 207 Topic 3: Centroids & Second Moments of Area (5 Questions)
-- =====================================================================

INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000207030001',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222270003',
    'numeric',
    'Calculate the centroidal second moment of area $I_{xc}$ (in $\text{cm}^4$) for a solid rectangular beam cross-section of width $b = 4.0\,\text{cm}$ and height $h = 6.0\,\text{cm}$.',
    72.0,
    1.0,
    'cm⁴',
    '**Step 1:** Recall the centroidal moment of inertia of a rectangle:\n$$I_{xc} = \frac{b h^3}{12}$$\n\n**Step 2:** Substitute $b = 4.0\,\text{cm}$ and $h = 6.0\,\text{cm}$:\n$$I_{xc} = \frac{4.0 \times 6.0^3}{12} = \frac{4.0 \times 216}{12} = 72.0\,\text{cm}^4$$',
    'easy',
    ARRAY['moment-of-inertia', 'rectangle'],
    'original',
    'draft',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000207030002',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222270003',
    'numeric',
    'Using the Parallel-Axis Theorem, find the second moment of area $I_{\text{base}}$ (in $\text{cm}^4$) of a $4.0\,\text{cm}$ wide $\times 6.0\,\text{cm}$ tall rectangle about its **bottom horizontal edge**.',
    288.0,
    1.0,
    'cm⁴',
    '**Step 1:** From the centroidal axis, $I_{xc} = 72.0\,\text{cm}^4$, $A = 4 \times 6 = 24\,\text{cm}^2$, and transfer distance $d = h/2 = 3.0\,\text{cm}$.\n\n**Step 2:** Apply $I_{\text{base}} = I_{xc} + A d^2$:\n$$I_{\text{base}} = 72 + 24(3^2) = 72 + 216 = 288.0\,\text{cm}^4$$',
    'medium',
    ARRAY['parallel-axis-theorem', 'second-moment'],
    'original',
    'draft',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000207030003',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222270003',
    'numeric',
    'A symmetric T-section consists of a vertical web ($2.0\,\text{cm}$ wide $\times 8.0\,\text{cm}$ tall) topped by a horizontal flange ($8.0\,\text{cm}$ wide $\times 2.0\,\text{cm}$ tall). Find the centroid height $\bar{y}$ measured upward from the bottom edge (in $\text{cm}$).',
    6.5,
    1.0,
    'cm',
    '**Step 1:** Web: $A_1 = 2 \times 8 = 16\,\text{cm}^2$, $y_1 = 4.0\,\text{cm}$. Flange: $A_2 = 8 \times 2 = 16\,\text{cm}^2$, $y_2 = 8 + 1 = 9.0\,\text{cm}$.\n\n**Step 2:** Composite centroid:\n$$\bar{y} = \frac{16(4.0) + 16(9.0)}{16 + 16} = \frac{64 + 144}{32} = \frac{208}{32} = 6.5\,\text{cm}$$',
    'medium',
    ARRAY['centroid', 'composite-area', 'beer-johnston-ch5'],
    'original',
    'draft',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000207030004',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222270003',
    'numeric',
    'A structural section has cross-sectional area $A = 25\,\text{cm}^2$ and second moment of area $I_x = 400\,\text{cm}^4$. Compute its **radius of gyration** $k_x$ in $\text{cm}$.',
    4.0,
    1.0,
    'cm',
    '**Step 1:** Recall $k_x = \sqrt{\frac{I_x}{A}}$.\n\n**Step 2:** Substitute:\n$$k_x = \sqrt{\frac{400}{25}} = \sqrt{16} = 4.0\,\text{cm}$$',
    'easy',
    ARRAY['radius-of-gyration', 'moment-of-inertia'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000207030005',
    '11111111-1111-4111-8111-111111111207',
    '22222222-2222-4222-8222-222222270003',
    'mcq',
    'When applying the Parallel-Axis Theorem $I = I_c + A d^2$, what is mandatory about the reference axis for $I_c$?',
    '**Step 1:** The theorem $I = I_c + Ad^2$ is valid **only** when $I_c$ is evaluated about an axis passing through the **centroid** of the area and parallel to the target axis.',
    'easy',
    ARRAY['parallel-axis-theorem', 'theory'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-020703005001', '33333333-3333-4333-8333-000207030005', 'A', 'It must pass through the centroid of the area and be parallel to the target axis.', TRUE, 1),
  ('44444444-4444-4444-8444-020703005002', '33333333-3333-4333-8333-000207030005', 'B', 'It can be any convenient edge of the cross-section.', FALSE, 2),
  ('44444444-4444-4444-8444-020703005003', '33333333-3333-4333-8333-000207030005', 'C', 'It must be perpendicular to the target axis.', FALSE, 3),
  ('44444444-4444-4444-8444-020703005004', '33333333-3333-4333-8333-000207030005', 'D', 'It applies only to symmetric circles and squares.', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- =====================================================================
-- GET 209 Topic 2: First-Order Linear Differential Equations (5 Questions)
-- =====================================================================

INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000209020001',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222290002',
    'mcq',
    'Find the integrating factor $\mu(x)$ for the first-order linear ODE $x\frac{dy}{dx} + 2y = 5x^3$ (for $x > 0$).',
    '**Step 1:** Divide through by $x$ to put the ODE in standard form:\n$$\frac{dy}{dx} + \frac{2}{x}y = 5x^2$$\n\n**Step 2:** Here $P(x) = \frac{2}{x}$, so:\n$$\mu(x) = e^{\int \frac{2}{x}\,dx} = e^{2\ln x} = x^2$$',
    'easy',
    ARRAY['integrating-factor', 'first-order-ode', 'stewart-ch9'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-020902001001', '33333333-3333-4333-8333-000209020001', 'A', '$\mu(x) = x^2$', TRUE, 1),
  ('44444444-4444-4444-8444-020902001002', '33333333-3333-4333-8333-000209020001', 'B', '$\mu(x) = e^{2x}$', FALSE, 2),
  ('44444444-4444-4444-8444-020902001003', '33333333-3333-4333-8333-000209020001', 'C', '$\mu(x) = 2\ln x$', FALSE, 3),
  ('44444444-4444-4444-8444-020902001004', '33333333-3333-4333-8333-000209020001', 'D', '$\mu(x) = x^{-2}$', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000209020002',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222290002',
    'numeric',
    'Solve $\frac{dy}{dx} + 3y = 12$ with initial condition $y(0) = 9$. Writing the particular solution in the form $y(x) = 4 + Ce^{-3x}$, enter the value of $C$.',
    5.0,
    1.0,
    '',
    '**Step 1:** Integrating factor $\mu(x) = e^{3x}$ gives $\frac{d}{dx}(e^{3x}y) = 12e^{3x}$.\n\n**Step 2:** Integrate: $e^{3x}y = 4e^{3x} + C \implies y(x) = 4 + Ce^{-3x}$.\n\n**Step 3:** Apply $y(0) = 9$: $9 = 4 + C \implies C = 5$.',
    'easy',
    ARRAY['initial-value-problem', 'first-order-ode'],
    'original',
    'draft',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000209020003',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222290002',
    'numeric',
    'Solve the IVP $\frac{dy}{dx} + 2y = 6e^x$ with $y(0) = 5$, then compute the exact value of $y(\ln 2)$ as a decimal.',
    4.75,
    1.0,
    '',
    '**Step 1:** Integrating factor $\mu(x) = e^{2x}$ yields $\frac{d}{dx}(e^{2x}y) = 6e^{3x} \implies y(x) = 2e^x + Ce^{-2x}$.\n\n**Step 2:** From $y(0) = 5$, $C = 3$, so $y(x) = 2e^x + 3e^{-2x}$.\n\n**Step 3:** At $x = \ln 2$, $e^{\ln 2} = 2$ and $e^{-2\ln 2} = \frac{1}{4}$:\n$$y(\ln 2) = 2(2) + 3\left(\frac{1}{4}\right) = 4 + 0.75 = 4.75$$',
    'medium',
    ARRAY['integrating-factor', 'ivp'],
    'original',
    'draft',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000209020004',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222290002',
    'numeric',
    'Given $x\frac{dy}{dx} + y = 3x^2$ ($x > 0$) with $y(1) = 4$, calculate $y(3)$.',
    10.0,
    1.0,
    '',
    '**Step 1:** Notice the left side is already an exact product derivative: $\frac{d}{dx}(xy) = 3x^2$.\n\n**Step 2:** Integrate: $xy = x^3 + C \implies y(x) = x^2 + \frac{C}{x}$.\n\n**Step 3:** Using $y(1) = 4 \implies 1 + C = 4 \implies C = 3$.\n\n**Step 4:** Evaluate at $x = 3$: $y(3) = 3^2 + \frac{3}{3} = 9 + 1 = 10$.',
    'medium',
    ARRAY['exact-product-rule', 'first-order-ode'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000209020005',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222290002',
    'mcq',
    'Which differential equation below is **NOT** a first-order linear ODE in $y(x)$?',
    '**Step 1:** A first-order linear ODE must have $y$ and $y''$ appearing only to the first power with coefficients depending only on $x$.\n\n**Step 2:** The term $y^2$ in $\frac{dy}{dx} + xy^2 = 3x$ makes the equation **nonlinear** (it is a Bernoulli equation).',
    'easy',
    ARRAY['ode-classification', 'linear-vs-nonlinear'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-020902005001', '33333333-3333-4333-8333-000209020005', 'A', '$\frac{dy}{dx} + (\sin x)\,y = e^x$', FALSE, 1),
  ('44444444-4444-4444-8444-020902005002', '33333333-3333-4333-8333-000209020005', 'B', '$x^2\frac{dy}{dx} - 4y = \ln x$', FALSE, 2),
  ('44444444-4444-4444-8444-020902005003', '33333333-3333-4333-8333-000209020005', 'C', '$\frac{dy}{dx} + x y^2 = 3x$', TRUE, 3),
  ('44444444-4444-4444-8444-020902005004', '33333333-3333-4333-8333-000209020005', 'D', '$\frac{dy}{dx} - 5y = 0$', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- =====================================================================
-- GET 209 Topic 3: Partial Derivatives, Gradients & Matrices (5 Questions)
-- =====================================================================

INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000209030001',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222290003',
    'numeric',
    'For $f(x, y) = 3x^2 y + 4y^3$, evaluate the partial derivative $\frac{\partial f}{\partial x}$ at the point $(2, 5)$.',
    60.0,
    1.0,
    '',
    '**Step 1:** Differentiate with respect to $x$ while holding $y$ constant:\n$$\frac{\partial f}{\partial x} = 6xy + 0 = 6xy$$\n\n**Step 2:** Evaluate at $(2, 5)$:\n$$6(2)(5) = 60$$',
    'easy',
    ARRAY['partial-derivatives', 'stewart-ch14'],
    'original',
    'draft',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000209030002',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222290003',
    'numeric',
    'Find the directional derivative $D_{\hat{u}} T$ of $T(x, y) = x^2 y + 2y^2$ at $(2, 1)$ in the direction of $\vec{v} = 3\hat{i} + 4\hat{j}$.',
    8.8,
    1.0,
    '',
    '**Step 1:** Compute gradient $\nabla T = (2xy)\hat{i} + (x^2 + 4y)\hat{j}$. At $(2, 1)$: $\nabla T(2, 1) = 4\hat{i} + 8\hat{j}$.\n\n**Step 2:** Normalize $\vec{v}$: $|\vec{v}| = 5 \implies \hat{u} = \frac{3}{5}\hat{i} + \frac{4}{5}\hat{j}$.\n\n**Step 3:** Dot product:\n$$D_{\hat{u}} T = 4\left(\frac{3}{5}\right) + 8\left(\frac{4}{5}\right) = \frac{12 + 32}{5} = \frac{44}{5} = 8.8$$',
    'medium',
    ARRAY['gradient', 'directional-derivative', 'schaums-vector'],
    'original',
    'draft',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000209030003',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222290003',
    'numeric',
    'Find the value of $k$ for which the $2 \times 2$ matrix $M = \begin{pmatrix} k & 6 \\ 2 & 4 \end{pmatrix}$ is **singular**.',
    3.0,
    1.0,
    '',
    '**Step 1:** A square matrix is singular when $\det(M) = 0$.\n\n**Step 2:** Solve $4k - (6)(2) = 0 \implies 4k = 12 \implies k = 3$.',
    'easy',
    ARRAY['matrices', 'singular', 'schaums-linalg'],
    'original',
    'draft',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-000209030004',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222290003',
    'numeric',
    'Compute the determinant of the $3 \times 3$ matrix:\n$$A = \begin{pmatrix} 2 & 1 & 0 \\ 0 & 3 & 4 \\ 1 & 0 & 2 \end{pmatrix}$$',
    16.0,
    1.0,
    '',
    '**Step 1:** Expand along the first row:\n$$\det(A) = 2\begin{vmatrix} 3 & 4 \\ 0 & 2 \end{vmatrix} - 1\begin{vmatrix} 0 & 4 \\ 1 & 2 \end{vmatrix} + 0$$\n\n**Step 2:** Evaluate the $2 \times 2$ minors:\n$$\det(A) = 2(6 - 0) - 1(0 - 4) = 12 + 4 = 16$$',
    'medium',
    ARRAY['determinants', '3x3-matrix', 'schaums-linalg'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, solution_md, difficulty, tags, source, status, is_free) VALUES
  (
    '33333333-3333-4333-8333-000209030005',
    '11111111-1111-4111-8111-111111111209',
    '22222222-2222-4222-8222-222222290003',
    'mcq',
    'At any point $(x_0, y_0)$ on a smooth scalar field $f(x, y)$, the **maximum possible directional derivative** occurs in the direction of:',
    '**Step 1:** Since $D_{\hat{u}} f = \nabla f \cdot \hat{u} = |\nabla f|\cos\theta$, the value is maximized when $\cos\theta = 1$ ($\theta = 0$).\n\n**Step 2:** Thus $f$ increases fastest in the direction of $\nabla f$, with maximum rate equal to $|\nabla f|$.',
    'easy',
    ARRAY['gradient', 'steepest-ascent'],
    'original',
    'draft',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, label, content_md, is_correct, display_order) VALUES
  ('44444444-4444-4444-8444-020903005001', '33333333-3333-4333-8333-000209030005', 'A', 'The gradient vector $\nabla f$, with maximum rate $|\nabla f|$.', TRUE, 1),
  ('44444444-4444-4444-8444-020903005002', '33333333-3333-4333-8333-000209030005', 'B', 'Perpendicular to $\nabla f$, with maximum rate $0$.', FALSE, 2),
  ('44444444-4444-4444-8444-020903005003', '33333333-3333-4333-8333-000209030005', 'C', 'Opposite to $\nabla f$, with maximum rate $-|\nabla f|$.', FALSE, 3),
  ('44444444-4444-4444-8444-020903005004', '33333333-3333-4333-8333-000209030005', 'D', 'Always along the positive $x$-axis.', FALSE, 4)
ON CONFLICT (question_id, label) DO NOTHING;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM topics WHERE id IN (
  '22222222-2222-4222-8222-222222250002',
  '22222222-2222-4222-8222-222222250003',
  '22222222-2222-4222-8222-222222270002',
  '22222222-2222-4222-8222-222222270003',
  '22222222-2222-4222-8222-222222290002',
  '22222222-2222-4222-8222-222222290003'
);
-- +goose StatementEnd

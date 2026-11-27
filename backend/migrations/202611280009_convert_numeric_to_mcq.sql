-- +goose Up
-- +goose StatementBegin
-- Convert all existing numeric (subjective free-text) questions into 4-option
-- objective multiple-choice (A-D) questions with plausible engineering distractors.
DO $$
DECLARE
    q RECORD;
    ans DOUBLE PRECISION;
    slot INT;
    d1 DOUBLE PRECISION;
    d2 DOUBLE PRECISION;
    d3 DOUBLE PRECISION;
    vals DOUBLE PRECISION[];
    sorted_vals DOUBLE PRECISION[];
    labels TEXT[] := ARRAY['A', 'B', 'C', 'D'];
    v DOUBLE PRECISION;
    num_txt TEXT;
    opt_txt TEXT;
    u TEXT;
    i INT;
BEGIN
    FOR q IN
        SELECT id, numeric_answer, COALESCE(TRIM(numeric_unit), '') AS unit
        FROM questions
        WHERE question_type = 'numeric' AND numeric_answer IS NOT NULL
    LOOP
        ans := q.numeric_answer;
        u := q.unit;
        slot := ABS(HASHTEXT(q.id::text)) % 4;

        IF ans = 0 THEN
            vals := ARRAY[0, 1, 2, 3];
        ELSIF ans > 0 THEN
            IF slot = 0 THEN
                d1 := ROUND((ans * 1.14)::numeric, 2);
                d2 := ROUND((ans * 1.32)::numeric, 2);
                d3 := ROUND((ans * 1.56)::numeric, 2);
            ELSIF slot = 1 THEN
                d1 := ROUND((ans * 0.78)::numeric, 2);
                d2 := ROUND((ans * 1.18)::numeric, 2);
                d3 := ROUND((ans * 1.42)::numeric, 2);
            ELSIF slot = 2 THEN
                d1 := ROUND((ans * 0.64)::numeric, 2);
                d2 := ROUND((ans * 0.84)::numeric, 2);
                d3 := ROUND((ans * 1.24)::numeric, 2);
            ELSE
                d1 := ROUND((ans * 0.52)::numeric, 2);
                d2 := ROUND((ans * 0.72)::numeric, 2);
                d3 := ROUND((ans * 0.86)::numeric, 2);
            END IF;
            IF d1 = ans OR d1 = 0 THEN d1 := ROUND((ans + 1)::numeric, 2); END IF;
            IF d2 = ans OR d2 = d1 THEN d2 := ROUND((ans + 2)::numeric, 2); END IF;
            IF d3 = ans OR d3 = d1 OR d3 = d2 THEN d3 := ROUND((ans + 3)::numeric, 2); END IF;
            vals := ARRAY[ans, d1, d2, d3];
        ELSE
            d1 := ROUND((ans * 1.25)::numeric, 2);
            d2 := ROUND((ans * 0.75)::numeric, 2);
            d3 := ROUND((-ans)::numeric, 2);
            IF d1 = ans THEN d1 := ans - 2; END IF;
            IF d2 = ans OR d2 = d1 THEN d2 := ans + 2; END IF;
            IF d3 = ans OR d3 = d1 OR d3 = d2 THEN d3 := -ans + 1; END IF;
            vals := ARRAY[ans, d1, d2, d3];
        END IF;

        SELECT ARRAY_AGG(x ORDER BY x ASC) INTO sorted_vals FROM UNNEST(vals) AS x;

        DELETE FROM question_options WHERE question_id = q.id;

        FOR i IN 1..4 LOOP
            v := sorted_vals[i];
            IF v = TRUNC(v) THEN
                num_txt := TRIM(TO_CHAR(v, 'FM999999999990'));
            ELSE
                num_txt := TRIM(TRAILING '.' FROM TRIM(TRAILING '0' FROM TO_CHAR(v, 'FM999999999990.0000')));
            END IF;

            IF u = '' THEN
                opt_txt := '$' || num_txt || '$';
            ELSIF u IN ('deg', '°') THEN
                opt_txt := '$' || num_txt || '^\circ$';
            ELSIF u = '%' THEN
                opt_txt := '$' || num_txt || '\%$';
            ELSE
                opt_txt := '$' || num_txt || '\,\text{' || u || '}$';
            END IF;

            INSERT INTO question_options (question_id, label, content_md, is_correct, display_order)
            VALUES (q.id, labels[i], opt_txt, (v = ans), i);
        END LOOP;

        UPDATE questions
        SET question_type = 'mcq', updated_at = NOW()
        WHERE id = q.id;
    END LOOP;
END $$;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 1;
-- +goose StatementEnd

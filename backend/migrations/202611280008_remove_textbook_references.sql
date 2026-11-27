-- +goose Up
-- Remove legacy textbook citations and author/edition callouts from seeded
-- questions so students see clean, self-contained engineering problems.

UPDATE questions
SET
  prompt_md = TRIM(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          prompt_md,
          '^\*\*\[[^\]]+\]\*\*\s*',
          ''
        ),
        '\s*\((?:Çengel|Cengel|Hibbeler|Stewart|Beer(?:\s*&\s*Johnston)?|H\.\s*K\.\s*Dass|Dass)[^)]*\)',
        '',
        'gi'
      ),
      'in the lower panel of Stewart Figure \d+',
      'in the lower panel of the figure',
      'gi'
    )
  ),
  solution_md = TRIM(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        solution_md,
        '\s*\((?:Çengel|Cengel|Hibbeler|Stewart|Beer(?:\s*&\s*Johnston)?|H\.\s*K\.\s*Dass|Dass)[^)]*\)',
        '',
        'gi'
      ),
      '\s*\(§\s*\d+(?:\.\d+)*[^)]*\)',
      '',
      'g'
    )
  ),
  updated_at = NOW()
WHERE
  prompt_md ~* '^\*\*\[|Çengel|Cengel|Hibbeler|Stewart|Beer|Johnston|Dass'
  OR solution_md ~* 'Çengel|Cengel|Hibbeler|Stewart|Beer|Johnston|Dass|§\s*\d';

-- +goose Down
-- No-op: textbook citations are intentionally not restored on rollback.
SELECT 1;

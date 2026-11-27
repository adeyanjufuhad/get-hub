// Command seed-content syncs study content from the repo's content/ folder into
// Postgres: topics (from course.json + topic MDX frontmatter) and question banks.
//
// It is idempotent. Topic ids come from course.json; question ids are derived
// deterministically from course slug, topic slug and the question key, so
// re-running updates rows in place and attempts keep pointing at the same rows.
// Nothing is ever deleted: topics/questions that are no longer in the content
// are set to status='draft'.
//
//	go run ./cmd/seed-content -dry-run
//	go run ./cmd/seed-content -course get-209
package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"github.com/adeyanjufuhad/get-hub/backend/internal/config"
	"github.com/adeyanjufuhad/get-hub/backend/internal/db"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

// questionNamespace is the fixed namespace for deriving question ids. Never change it:
// every question id in the database is derived from it.
var questionNamespace = uuid.MustParse("6f1d2b9e-3c4a-4d5e-9a7b-0c8e1f2a3b4c")

type courseManifest struct {
	Code                  string       `json:"code"`
	Slug                  string       `json:"slug"`
	Title                 string       `json:"title"`
	Textbook              string       `json:"textbook"`
	RetireLegacyQuestions bool         `json:"retireLegacyQuestions"`
	Topics                []topicEntry `json:"topics"`
}

type topicEntry struct {
	Slug     string `json:"slug"`
	TopicID  string `json:"topicId"`
	Title    string `json:"title"`
	Order    int    `json:"order"`
	CcmasRef string `json:"ccmasRef"`
	BookRef  string `json:"bookRef"`
	Part     string `json:"part"`
	Status   string `json:"status"`
	IsFree   *bool  `json:"isFree"`
}

type bank struct {
	TopicSlug string     `json:"topicSlug"`
	Questions []question `json:"questions"`
}

type question struct {
	Key          string   `json:"key"`
	Type         string   `json:"type"`
	Prompt       string   `json:"prompt"`
	Image        string   `json:"image"`
	Answer       *float64 `json:"answer"`
	TolerancePct *float64 `json:"tolerancePct"`
	Unit         string   `json:"unit"`
	Options      []option `json:"options"`
	Solution     string   `json:"solution"`
	Difficulty   string   `json:"difficulty"`
	Source       string   `json:"source"`
	Tags         []string `json:"tags"`
}

type option struct {
	Label   string `json:"label"`
	Text    string `json:"text"`
	Correct bool   `json:"correct"`
}

// plannedTopic is a topic with everything read from disk.
type plannedTopic struct {
	entry     topicEntry
	outcomes  []string
	hasMDX    bool
	hasBank   bool
	questions []plannedQuestion
}

type plannedQuestion struct {
	id uuid.UUID
	q  question
}

type coursePlan struct {
	manifest courseManifest
	topics   []plannedTopic
	warnings []string
}

var (
	keyRe      = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)
	validDiffs = map[string]bool{"easy": true, "medium": true, "hard": true}
)

func main() {
	if err := config.LoadDefaultDotEnv(); err != nil {
		log.Fatalf("load .env: %v", err)
	}
	contentFlag := flag.String("content", defaultContentDir(), "Path to the repo content/ folder")
	courseFlag := flag.String("course", "", "Optional course slug filter (e.g. get-209)")
	dryRun := flag.Bool("dry-run", false, "Parse and validate everything and print the plan; never connects to the database")
	flag.Parse()

	slugs, err := courseSlugs(*contentFlag, strings.TrimSpace(*courseFlag))
	if err != nil {
		log.Fatal(err)
	}

	var plans []*coursePlan
	failed := false
	for _, slug := range slugs {
		plan, errs := buildPlan(*contentFlag, slug)
		for _, w := range plan.warnings {
			fmt.Printf("warning: %s\n", w)
		}
		for _, e := range errs {
			fmt.Fprintf(os.Stderr, "error: %v\n", e)
			failed = true
		}
		plans = append(plans, plan)
	}
	if failed {
		log.Fatal("content validation failed; nothing was written")
	}

	for _, p := range plans {
		printPlan(p)
	}
	if *dryRun {
		fmt.Println("dry run: no database connection was made")
		return
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}
	ctx := context.Background()
	pool, err := db.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	defer pool.Close()

	for _, p := range plans {
		sum, err := seedCourse(ctx, pool, p)
		if err != nil {
			log.Fatalf("seed %s: %v (transaction rolled back)", p.manifest.Slug, err)
		}
		fmt.Printf("%s: topics upserted=%d retired=%d, questions upserted=%d retired=%d\n",
			p.manifest.Slug, sum.topicsUpserted, sum.topicsRetired, sum.questionsUpserted, sum.questionsRetired)
	}
}

func defaultContentDir() string {
	for _, p := range []string{"../content", "content"} {
		if st, err := os.Stat(filepath.Join(p, "courses")); err == nil && st.IsDir() {
			return p
		}
	}
	return "../content"
}

func courseSlugs(contentDir, filter string) ([]string, error) {
	coursesDir := filepath.Join(contentDir, "courses")
	entries, err := os.ReadDir(coursesDir)
	if err != nil {
		return nil, fmt.Errorf("read %s: %w", coursesDir, err)
	}
	var out []string
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		if _, err := os.Stat(filepath.Join(coursesDir, e.Name(), "course.json")); err != nil {
			continue
		}
		if filter != "" && e.Name() != filter {
			continue
		}
		out = append(out, e.Name())
	}
	if len(out) == 0 {
		if filter != "" {
			return nil, fmt.Errorf("no course.json found for -course %q under %s", filter, coursesDir)
		}
		return nil, fmt.Errorf("no courses found under %s", coursesDir)
	}
	sort.Strings(out)
	return out, nil
}

// buildPlan reads and validates one course. Missing MDX/bank files are warnings;
// everything else wrong is returned as errors.
func buildPlan(contentDir, slug string) (*coursePlan, []error) {
	plan := &coursePlan{}
	var errs []error
	dir := filepath.Join(contentDir, "courses", slug)
	manifestPath := filepath.Join(dir, "course.json")

	raw, err := os.ReadFile(manifestPath)
	if err != nil {
		return plan, []error{fmt.Errorf("%s: %w", manifestPath, err)}
	}
	if err := json.Unmarshal(raw, &plan.manifest); err != nil {
		return plan, []error{fmt.Errorf("%s: invalid JSON: %w", manifestPath, err)}
	}
	m := &plan.manifest
	if m.Slug != slug {
		errs = append(errs, fmt.Errorf("%s: slug %q does not match folder name %q", manifestPath, m.Slug, slug))
	}
	if strings.TrimSpace(m.Code) == "" {
		errs = append(errs, fmt.Errorf("%s: code is required", manifestPath))
	}

	seenSlug := map[string]bool{}
	seenID := map[string]bool{}
	known := map[string]bool{}
	for _, t := range m.Topics {
		known[t.Slug] = true
	}
	for _, t := range m.Topics {
		where := fmt.Sprintf("%s: topic %q", manifestPath, t.Slug)
		if t.Slug == "" || t.Title == "" {
			errs = append(errs, fmt.Errorf("%s: slug and title are required", where))
			continue
		}
		if _, err := uuid.Parse(t.TopicID); err != nil {
			errs = append(errs, fmt.Errorf("%s: topicId %q is not a UUID", where, t.TopicID))
		}
		if seenSlug[t.Slug] {
			errs = append(errs, fmt.Errorf("%s: duplicate slug", where))
		}
		if seenID[t.TopicID] {
			errs = append(errs, fmt.Errorf("%s: duplicate topicId %s", where, t.TopicID))
		}
		seenSlug[t.Slug], seenID[t.TopicID] = true, true
		if t.Status == "" {
			t.Status = "published"
		}
		if t.Status != "published" && t.Status != "draft" {
			errs = append(errs, fmt.Errorf("%s: status %q must be draft or published", where, t.Status))
		}

		pt := plannedTopic{entry: t}

		mdxPath := filepath.Join(dir, "topics", t.Slug+".mdx")
		if data, err := os.ReadFile(mdxPath); err == nil {
			pt.hasMDX = true
			outcomes, perr := parseOutcomes(string(data))
			if perr != nil {
				errs = append(errs, fmt.Errorf("%s: %w", mdxPath, perr))
			}
			pt.outcomes = outcomes
		} else if errors.Is(err, os.ErrNotExist) {
			plan.warnings = append(plan.warnings, fmt.Sprintf("%s: MDX missing (%s); outcomes left unchanged", slug, filepath.ToSlash(mdxPath)))
		} else {
			errs = append(errs, fmt.Errorf("%s: %w", mdxPath, err))
		}

		bankPath := filepath.Join(dir, "questions", t.Slug+".json")
		if data, err := os.ReadFile(bankPath); err == nil {
			pt.hasBank = true
			var b bank
			if err := json.Unmarshal(data, &b); err != nil {
				errs = append(errs, fmt.Errorf("%s: invalid JSON: %w", bankPath, err))
			} else {
				bankErrs, bankWarns := validateBank(bankPath, t.Slug, b)
				errs = append(errs, bankErrs...)
				plan.warnings = append(plan.warnings, bankWarns...)
				for _, q := range b.Questions {
					pt.questions = append(pt.questions, plannedQuestion{id: questionID(slug, t.Slug, q.Key), q: q})
				}
			}
		} else if errors.Is(err, os.ErrNotExist) {
			plan.warnings = append(plan.warnings, fmt.Sprintf("%s: question bank missing (%s)", slug, filepath.ToSlash(bankPath)))
		} else {
			errs = append(errs, fmt.Errorf("%s: %w", bankPath, err))
		}
		plan.topics = append(plan.topics, pt)
	}

	// Banks on disk with no matching topic.
	if entries, err := os.ReadDir(filepath.Join(dir, "questions")); err == nil {
		for _, e := range entries {
			name := strings.TrimSuffix(e.Name(), ".json")
			if e.IsDir() || name == e.Name() || known[name] {
				continue
			}
			plan.warnings = append(plan.warnings, fmt.Sprintf("%s: questions/%s has no matching topic in course.json (ignored)", slug, e.Name()))
		}
	}
	return plan, errs
}

// questionID derives the stable database id of a question.
func questionID(courseSlug, topicSlug, key string) uuid.UUID {
	return uuid.NewSHA1(questionNamespace, []byte(courseSlug+"/"+topicSlug+"/"+key))
}

// validateBank checks a bank like AUTHORING.md describes. file is only used in messages.
func validateBank(file, topicSlug string, b bank) (errs []error, warns []string) {
	fail := func(key, format string, args ...any) {
		errs = append(errs, fmt.Errorf("%s: question %q: %s", file, key, fmt.Sprintf(format, args...)))
	}
	if b.TopicSlug != topicSlug {
		errs = append(errs, fmt.Errorf("%s: topicSlug is %q, expected %q", file, b.TopicSlug, topicSlug))
	}
	if len(b.Questions) == 0 {
		errs = append(errs, fmt.Errorf("%s: bank has no questions", file))
	} else if n := len(b.Questions); n < 12 || n > 20 {
		warns = append(warns, fmt.Sprintf("%s: has %d questions (AUTHORING.md asks for 12-20)", file, n))
	}

	seen := map[string]bool{}
	for i, q := range b.Questions {
		key := q.Key
		if key == "" {
			key = fmt.Sprintf("#%d", i+1)
			fail(key, "key is required")
		} else {
			if !keyRe.MatchString(key) {
				fail(key, "key must be kebab-case (lowercase letters, digits, hyphens)")
			}
			if seen[key] {
				fail(key, "duplicate key")
			}
			seen[key] = true
		}
		if strings.TrimSpace(q.Prompt) == "" {
			fail(key, "prompt is required")
		}
		if strings.TrimSpace(q.Solution) == "" {
			fail(key, "solution is required")
		}
		if !validDiffs[q.Difficulty] {
			fail(key, "difficulty %q must be easy, medium or hard", q.Difficulty)
		}
		switch q.Type {
		case "numeric":
			if q.Answer == nil {
				fail(key, "numeric question needs an answer")
			}
			if q.TolerancePct != nil && *q.TolerancePct <= 0 {
				fail(key, "tolerancePct must be > 0")
			}
			if len(q.Options) > 0 {
				fail(key, "numeric question must not have options")
			}
		case "mcq":
			validateOptions(q.Options, func(f string, a ...any) { fail(key, f, a...) })
		default:
			fail(key, "type %q must be numeric or mcq", q.Type)
		}
	}
	return errs, warns
}

func validateOptions(opts []option, fail func(string, ...any)) {
	if len(opts) != 4 {
		fail("mcq needs exactly 4 options A-D, got %d", len(opts))
		return
	}
	labels := map[string]bool{}
	correct := 0
	for _, o := range opts {
		if labelOrder(o.Label) == 0 {
			fail("option label %q must be one of A, B, C, D", o.Label)
		} else if labels[o.Label] {
			fail("duplicate option label %q", o.Label)
		}
		labels[o.Label] = true
		if strings.TrimSpace(o.Text) == "" {
			fail("option %s has empty text", o.Label)
		}
		if o.Correct {
			correct++
		}
	}
	if correct != 1 {
		fail("mcq needs exactly one correct option, got %d", correct)
	}
}

func labelOrder(label string) int {
	switch label {
	case "A":
		return 1
	case "B":
		return 2
	case "C":
		return 3
	case "D":
		return 4
	}
	return 0
}

// parseOutcomes reads the `outcomes:` list from the YAML frontmatter of an MDX file.
// Only the simple form used by the content is supported: a block list of scalars
// (or an inline `[]`). A missing frontmatter or missing key yields no outcomes.
func parseOutcomes(mdx string) ([]string, error) {
	mdx = strings.TrimPrefix(strings.ReplaceAll(mdx, "\r\n", "\n"), "ï»¿")
	lines := strings.Split(mdx, "\n")
	if len(lines) == 0 || strings.TrimRight(lines[0], " \t") != "---" {
		return nil, nil
	}
	end := -1
	for i := 1; i < len(lines); i++ {
		if strings.TrimRight(lines[i], " \t") == "---" {
			end = i
			break
		}
	}
	if end < 0 {
		return nil, errors.New("frontmatter is not closed with ---")
	}
	fm := lines[1:end]

	outcomes := []string{}
	for i := 0; i < len(fm); i++ {
		line := fm[i]
		if !strings.HasPrefix(line, "outcomes:") {
			continue
		}
		rest := strings.TrimSpace(strings.TrimPrefix(line, "outcomes:"))
		if rest == "[]" {
			return outcomes, nil
		}
		if rest != "" && !strings.HasPrefix(rest, "#") {
			return nil, errors.New("outcomes must be a block list (one `- item` per line)")
		}
		for _, item := range fm[i+1:] {
			trimmed := strings.TrimSpace(item)
			if trimmed == "" || strings.HasPrefix(trimmed, "#") {
				continue
			}
			if !strings.HasPrefix(trimmed, "- ") && trimmed != "-" {
				break
			}
			val, err := yamlScalar(strings.TrimSpace(strings.TrimPrefix(trimmed, "-")))
			if err != nil {
				return nil, fmt.Errorf("outcomes item %q: %w", trimmed, err)
			}
			if val != "" {
				outcomes = append(outcomes, val)
			}
		}
		return outcomes, nil
	}
	return outcomes, nil
}

// yamlScalar decodes a double-quoted, single-quoted or plain YAML scalar.
func yamlScalar(s string) (string, error) {
	if s == "" {
		return "", nil
	}
	switch s[0] {
	case '"':
		// YAML double-quoted escapes are close enough to JSON/Go for this content.
		end := closingQuote(s)
		if end < 0 {
			return "", errors.New("unterminated double-quoted string")
		}
		v, err := strconv.Unquote(s[:end+1])
		if err != nil {
			var js string
			if jerr := json.Unmarshal([]byte(s[:end+1]), &js); jerr != nil {
				return "", fmt.Errorf("bad double-quoted string: %w", err)
			}
			v = js
		}
		return v, nil
	case '\'':
		var sb strings.Builder
		for i := 1; i < len(s); i++ {
			if s[i] == '\'' {
				if i+1 < len(s) && s[i+1] == '\'' {
					sb.WriteByte('\'')
					i++
					continue
				}
				return sb.String(), nil
			}
			sb.WriteByte(s[i])
		}
		return "", errors.New("unterminated single-quoted string")
	}
	if i := strings.Index(s, " #"); i >= 0 {
		s = s[:i]
	}
	return strings.TrimSpace(s), nil
}

// closingQuote returns the index of the closing double quote of s (s[0] == '"'), or -1.
func closingQuote(s string) int {
	for i := 1; i < len(s); i++ {
		switch s[i] {
		case '\\':
			i++
		case '"':
			return i
		}
	}
	return -1
}

func printPlan(p *coursePlan) {
	m := p.manifest
	fmt.Printf("\n== %s (%s) — %s ==\n", m.Slug, m.Code, m.Title)
	fmt.Printf("   retireLegacyQuestions=%v, %d topics\n", m.RetireLegacyQuestions, len(p.topics))
	total := 0
	for _, t := range p.topics {
		mdx, bnk := "mdx:missing", "bank:missing"
		if t.hasMDX {
			mdx = fmt.Sprintf("mdx:ok(%d outcomes)", len(t.outcomes))
		}
		if t.hasBank {
			var num, mcq int
			for _, q := range t.questions {
				if q.q.Type == "numeric" {
					num++
				} else {
					mcq++
				}
			}
			bnk = fmt.Sprintf("bank:%d (numeric %d, mcq %d)", len(t.questions), num, mcq)
			total += len(t.questions)
		}
		fmt.Printf("   %2d %-48s %-9s %s  %s\n", t.entry.Order, t.entry.Slug, t.entry.Status, mdx, bnk)
	}
	fmt.Printf("   questions to upsert: %d\n", total)
	if m.RetireLegacyQuestions {
		fmt.Println("   will set status='draft' on all other questions of this course")
	}
}

type summary struct {
	topicsUpserted, topicsRetired, questionsUpserted, questionsRetired int
}

func seedCourse(ctx context.Context, pool interface {
	Begin(context.Context) (pgx.Tx, error)
}, p *coursePlan) (sum summary, err error) {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return sum, err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback(ctx)
		}
	}()

	m := p.manifest
	var courseID string
	err = tx.QueryRow(ctx, `SELECT id::text FROM courses WHERE code = $1`, m.Code).Scan(&courseID)
	if errors.Is(err, pgx.ErrNoRows) {
		return sum, fmt.Errorf("course with code %q not found in database", m.Code)
	}
	if err != nil {
		return sum, fmt.Errorf("look up course: %w", err)
	}

	topicIDs := make([]string, 0, len(p.topics))
	topicSlugs := make([]string, 0, len(p.topics))
	for _, t := range p.topics {
		topicIDs = append(topicIDs, t.entry.TopicID)
		topicSlugs = append(topicSlugs, t.entry.Slug)
	}

	// Park the slugs of topics being updated so renames cannot collide on UNIQUE(course_id, slug).
	if _, err = tx.Exec(ctx, `UPDATE topics SET slug = slug || '__tmp_' || id::text
		WHERE course_id = $1::uuid AND id = ANY($2::uuid[])`, courseID, topicIDs); err != nil {
		return sum, fmt.Errorf("park topic slugs: %w", err)
	}
	// A topic of this course that is not in course.json but still holds a slug we need moves aside.
	if _, err = tx.Exec(ctx, `UPDATE topics SET slug = slug || '__retired_' || id::text
		WHERE course_id = $1::uuid AND id <> ALL($2::uuid[]) AND slug = ANY($3::text[])`,
		courseID, topicIDs, topicSlugs); err != nil {
		return sum, fmt.Errorf("move aside colliding topic slugs: %w", err)
	}

	for _, t := range p.topics {
		var outcomes *string
		if t.hasMDX {
			b, _ := json.Marshal(nonNil(t.outcomes))
			s := string(b)
			outcomes = &s
		}
		isFree := true
		if t.entry.IsFree != nil {
			isFree = *t.entry.IsFree
		}
		tag, execErr := tx.Exec(ctx, `
			INSERT INTO topics (id, course_id, slug, title, display_order, ccmas_ref, outcomes, status, is_free)
			VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, COALESCE($7::jsonb, '[]'::jsonb), $8, $9)
			ON CONFLICT (id) DO UPDATE SET
				slug = EXCLUDED.slug,
				title = EXCLUDED.title,
				display_order = EXCLUDED.display_order,
				ccmas_ref = EXCLUDED.ccmas_ref,
				outcomes = COALESCE($7::jsonb, topics.outcomes),
				status = EXCLUDED.status,
				is_free = EXCLUDED.is_free,
				updated_at = NOW()
			WHERE topics.course_id = EXCLUDED.course_id`,
			t.entry.TopicID, courseID, t.entry.Slug, t.entry.Title, t.entry.Order, t.entry.CcmasRef, outcomes, t.entry.Status, isFree)
		if execErr != nil {
			return sum, fmt.Errorf("upsert topic %s: %w", t.entry.Slug, execErr)
		}
		if tag.RowsAffected() != 1 {
			return sum, fmt.Errorf("topic %s (%s) already exists under a different course", t.entry.Slug, t.entry.TopicID)
		}
		sum.topicsUpserted++
	}

	tag, err := tx.Exec(ctx, `UPDATE topics SET status = 'draft', updated_at = NOW()
		WHERE course_id = $1::uuid AND id <> ALL($2::uuid[]) AND status <> 'draft'`, courseID, topicIDs)
	if err != nil {
		return sum, fmt.Errorf("retire topics: %w", err)
	}
	sum.topicsRetired = int(tag.RowsAffected())

	var seeded []string
	for _, t := range p.topics {
		for _, pq := range t.questions {
			if err = upsertQuestion(ctx, tx, courseID, t.entry.TopicID, pq); err != nil {
				return sum, fmt.Errorf("topic %s, question %q: %w", t.entry.Slug, pq.q.Key, err)
			}
			seeded = append(seeded, pq.id.String())
			sum.questionsUpserted++
		}
	}

	if m.RetireLegacyQuestions {
		if len(seeded) == 0 {
			fmt.Printf("warning: %s: retireLegacyQuestions is set but no questions were seeded; skipping retirement\n", m.Slug)
		} else {
			tag, err = tx.Exec(ctx, `UPDATE questions SET status = 'draft', updated_at = NOW()
				WHERE course_id = $1::uuid AND id <> ALL($2::uuid[]) AND status <> 'draft'`, courseID, seeded)
			if err != nil {
				return sum, fmt.Errorf("retire legacy questions: %w", err)
			}
			sum.questionsRetired = int(tag.RowsAffected())
		}
	}

	if err = tx.Commit(ctx); err != nil {
		return sum, fmt.Errorf("commit: %w", err)
	}
	return sum, nil
}

func upsertQuestion(ctx context.Context, tx pgx.Tx, courseID, topicID string, pq plannedQuestion) error {
	q := pq.q
	var image *string
	if q.Image != "" {
		image = &q.Image
	}
	var answer *float64
	tol := 1.0
	if q.Type == "numeric" {
		answer = q.Answer
		if q.TolerancePct != nil {
			tol = *q.TolerancePct
		}
	}
	tags := q.Tags
	if tags == nil {
		tags = []string{}
	}
	prompt := q.Prompt

	tag, err := tx.Exec(ctx, `
		INSERT INTO questions (id, course_id, topic_id, question_type, prompt_md, prompt_image_url,
			numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md, difficulty, tags,
			source, status, is_free)
		VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7, $8, $9, $10, $11, $12::text[],
			'original', 'published', TRUE)
		ON CONFLICT (id) DO UPDATE SET
			topic_id = EXCLUDED.topic_id,
			question_type = EXCLUDED.question_type,
			prompt_md = EXCLUDED.prompt_md,
			prompt_image_url = EXCLUDED.prompt_image_url,
			numeric_answer = EXCLUDED.numeric_answer,
			numeric_tolerance_pct = EXCLUDED.numeric_tolerance_pct,
			numeric_unit = EXCLUDED.numeric_unit,
			solution_md = EXCLUDED.solution_md,
			difficulty = EXCLUDED.difficulty,
			tags = EXCLUDED.tags,
			source = 'original',
			status = 'published',
			is_free = TRUE,
			updated_at = NOW()
		WHERE questions.course_id = EXCLUDED.course_id`,
		pq.id.String(), courseID, topicID, q.Type, prompt, image, answer, tol, q.Unit, q.Solution, q.Difficulty, tags)
	if err != nil {
		return err
	}
	if tag.RowsAffected() != 1 {
		return errors.New("question id already exists under a different course")
	}

	if q.Type != "mcq" {
		_, err = tx.Exec(ctx, `DELETE FROM question_options WHERE question_id = $1::uuid`, pq.id.String())
		return err
	}
	for _, o := range q.Options {
		if _, err = tx.Exec(ctx, `
			INSERT INTO question_options (question_id, label, content_md, is_correct, display_order)
			VALUES ($1::uuid, $2, $3, $4, $5)
			ON CONFLICT (question_id, label) DO UPDATE SET
				content_md = EXCLUDED.content_md,
				is_correct = EXCLUDED.is_correct,
				display_order = EXCLUDED.display_order`,
			pq.id.String(), o.Label, o.Text, o.Correct, labelOrder(o.Label)); err != nil {
			return fmt.Errorf("option %s: %w", o.Label, err)
		}
	}
	return nil
}

func nonNil(s []string) []string {
	if s == nil {
		return []string{}
	}
	return s
}

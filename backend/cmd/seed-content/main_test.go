package main

import (
	"reflect"
	"strings"
	"testing"

	"github.com/google/uuid"
)

func TestQuestionIDDeterministic(t *testing.T) {
	a := questionID("get-209", "limits-and-continuity", "ex-1-1")
	b := questionID("get-209", "limits-and-continuity", "ex-1-1")
	if a != b {
		t.Fatalf("same inputs gave different ids: %s vs %s", a, b)
	}
	want := uuid.NewSHA1(questionNamespace, []byte("get-209/limits-and-continuity/ex-1-1"))
	if a != want {
		t.Fatalf("id = %s, want %s", a, want)
	}
	if a.Version() != 5 {
		t.Fatalf("version = %d, want 5", a.Version())
	}
	for name, other := range map[string]uuid.UUID{
		"course": questionID("get-207", "limits-and-continuity", "ex-1-1"),
		"topic":  questionID("get-209", "other-topic", "ex-1-1"),
		"key":    questionID("get-209", "limits-and-continuity", "ex-1-2"),
	} {
		if other == a {
			t.Errorf("changing %s did not change the id", name)
		}
	}
}

func TestParseOutcomes(t *testing.T) {
	mdx := "---\r\ntitle: \"X\"\r\norder: 2\r\noutcomes:\r\n" +
		"  - \"Apply \\\"quoted\\\" rule\"\r\n" +
		"  - 'It''s single'\r\n" +
		"  - plain text # trailing comment\r\n" +
		"  # a comment\r\n" +
		"  - \"Uses $\\\\frac{a}{b}$\"\r\n" +
		"status: \"published\"\r\n---\r\n\r\nbody\r\n- not an outcome\r\n"
	got, err := parseOutcomes(mdx)
	if err != nil {
		t.Fatal(err)
	}
	want := []string{`Apply "quoted" rule`, `It's single`, `plain text`, `Uses $\frac{a}{b}$`}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %#v\nwant %#v", got, want)
	}
}

func TestParseOutcomesEdgeCases(t *testing.T) {
	if got, err := parseOutcomes("no frontmatter\n"); err != nil || len(got) != 0 {
		t.Errorf("no frontmatter: got %v, %v", got, err)
	}
	if got, err := parseOutcomes("---\ntitle: x\n---\nbody"); err != nil || len(got) != 0 {
		t.Errorf("no outcomes key: got %v, %v", got, err)
	}
	if got, err := parseOutcomes("---\noutcomes: []\n---\n"); err != nil || len(got) != 0 {
		t.Errorf("empty inline list: got %v, %v", got, err)
	}
	if _, err := parseOutcomes("---\ntitle: x\n"); err == nil {
		t.Error("unclosed frontmatter should error")
	}
	if _, err := parseOutcomes("---\noutcomes: a, b\n---\n"); err == nil {
		t.Error("inline scalar outcomes should error")
	}
}

func f64(v float64) *float64 { return &v }

func mcq(key string) question {
	return question{
		Key: key, Type: "mcq", Prompt: "p", Solution: "s", Difficulty: "easy", Source: "Book, Ex 1",
		Options: []option{
			{Label: "A", Text: "1"}, {Label: "B", Text: "2", Correct: true},
			{Label: "C", Text: "3"}, {Label: "D", Text: "4"},
		},
	}
}

func numeric(key string) question {
	return question{Key: key, Type: "numeric", Prompt: "p", Solution: "s", Difficulty: "hard", Source: "Book, Ex 2", Answer: f64(2.5)}
}

func errText(errs []error) string {
	var sb strings.Builder
	for _, e := range errs {
		sb.WriteString(e.Error() + "\n")
	}
	return sb.String()
}

func TestValidateBankOK(t *testing.T) {
	errs, _ := validateBank("f.json", "topic", bank{TopicSlug: "topic", Questions: []question{mcq("a-1"), numeric("n-1")}})
	if len(errs) != 0 {
		t.Fatalf("unexpected errors: %s", errText(errs))
	}
}

func TestValidateBankErrors(t *testing.T) {
	bad := func(mut func(*question)) question {
		q := mcq("k")
		mut(&q)
		return q
	}
	cases := []struct {
		name string
		b    bank
		want string
	}{
		{"topic slug mismatch", bank{TopicSlug: "other", Questions: []question{mcq("k")}}, `expected "topic"`},
		{"empty bank", bank{TopicSlug: "topic"}, "no questions"},
		{"duplicate key", bank{TopicSlug: "topic", Questions: []question{mcq("dup"), mcq("dup")}}, `question "dup": duplicate key`},
		{"bad key", bank{TopicSlug: "topic", Questions: []question{mcq("Bad_Key")}}, "kebab-case"},
		{"missing key", bank{TopicSlug: "topic", Questions: []question{bad(func(q *question) { q.Key = "" })}}, "key is required"},
		{"bad difficulty", bank{TopicSlug: "topic", Questions: []question{bad(func(q *question) { q.Difficulty = "tough" })}}, `question "k": difficulty "tough"`},
		{"bad type", bank{TopicSlug: "topic", Questions: []question{bad(func(q *question) { q.Type = "essay" })}}, `type "essay"`},
		{"numeric no answer", bank{TopicSlug: "topic", Questions: []question{{Key: "n", Type: "numeric", Prompt: "p", Solution: "s", Difficulty: "easy", Source: "x"}}}, "needs an answer"},
		{"numeric bad tolerance", bank{TopicSlug: "topic", Questions: []question{func() question { q := numeric("n"); q.TolerancePct = f64(0); return q }()}}, "tolerancePct"},
		{"three options", bank{TopicSlug: "topic", Questions: []question{bad(func(q *question) { q.Options = q.Options[:3] })}}, "exactly 4 options"},
		{"two correct", bank{TopicSlug: "topic", Questions: []question{bad(func(q *question) { q.Options[0].Correct = true })}}, "exactly one correct option, got 2"},
		{"no correct", bank{TopicSlug: "topic", Questions: []question{bad(func(q *question) { q.Options[1].Correct = false })}}, "exactly one correct option, got 0"},
		{"duplicate label", bank{TopicSlug: "topic", Questions: []question{bad(func(q *question) { q.Options[3].Label = "C" })}}, `duplicate option label "C"`},
		{"bad label", bank{TopicSlug: "topic", Questions: []question{bad(func(q *question) { q.Options[3].Label = "E" })}}, `label "E"`},
		{"missing solution", bank{TopicSlug: "topic", Questions: []question{bad(func(q *question) { q.Solution = " " })}}, "solution is required"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			errs, _ := validateBank("questions/topic.json", "topic", tc.b)
			text := errText(errs)
			if !strings.Contains(text, tc.want) {
				t.Fatalf("errors %q do not contain %q", text, tc.want)
			}
			if !strings.Contains(text, "questions/topic.json") {
				t.Fatalf("errors %q do not name the file", text)
			}
		})
	}
}

func TestValidateBankCountWarning(t *testing.T) {
	_, warns := validateBank("f.json", "topic", bank{TopicSlug: "topic", Questions: []question{mcq("a")}})
	if len(warns) != 1 || !strings.Contains(warns[0], "12-20") {
		t.Fatalf("warnings = %v", warns)
	}
}

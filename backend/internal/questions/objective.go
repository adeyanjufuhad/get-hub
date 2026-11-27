package questions

import (
	"crypto/sha256"
	"encoding/binary"
	"fmt"
	"math"
	"sort"
	"strconv"
	"strings"

	"github.com/google/uuid"

	"github.com/adeyanjufuhad/get-hub/backend/internal/db/sqlc"
)

// syntheticOptionNamespace derives deterministic option UUIDs for legacy numeric
// DB rows that have not yet been migrated to native question_options rows.
var syntheticOptionNamespace = uuid.MustParse("8b3f5e21-4c7a-4b19-9d63-1e2f4a7c8b90")

type SyntheticOption struct {
	ID           uuid.UUID
	Label        string
	ContentMD    string
	DisplayOrder int32
	Value        float64
	IsCorrect    bool
}

// SynthesizeMCQ deterministically turns a numeric question into 4 objective A-D
// multiple-choice options with plausible engineering distractors.
func SynthesizeMCQ(q sqlc.Question) []SyntheticOption {
	if !q.NumericAnswer.Valid {
		return nil
	}
	ans := q.NumericAnswer.Float64
	dec := inferDecimals(ans)
	h := hashQuestionID(q.ID)
	targetSlot := int(h % 4)
	nonNeg := ans >= 0 && isLikelyNonNegative(q.NumericUnit, q.PromptMd)

	vals := buildCandidateValues(ans, dec, targetSlot, nonNeg)
	sort.Float64s(vals)

	labels := [4]string{"A", "B", "C", "D"}
	ansKey := formatNumber(ans, dec)
	opts := make([]SyntheticOption, 0, 4)
	for i, v := range vals {
		lbl := labels[i]
		opts = append(opts, SyntheticOption{
			ID:           uuid.NewSHA1(syntheticOptionNamespace, []byte(q.ID.String()+"/"+lbl)),
			Label:        lbl,
			ContentMD:    formatOptionLatex(v, dec, q.NumericUnit),
			DisplayOrder: int32(i + 1),
			Value:        v,
			IsCorrect:    formatNumber(v, dec) == ansKey,
		})
	}
	return opts
}

func hashQuestionID(id uuid.UUID) uint32 {
	sum := sha256.Sum256(id[:])
	return binary.BigEndian.Uint32(sum[:4])
}

func inferDecimals(v float64) int {
	if math.IsNaN(v) || math.IsInf(v, 0) {
		return 0
	}
	s := strconv.FormatFloat(v, 'f', -1, 64)
	dot := strings.IndexByte(s, '.')
	if dot < 0 {
		return 0
	}
	d := len(s) - dot - 1
	if d > 4 {
		return 4
	}
	return d
}

func roundDec(v float64, dec int) float64 {
	p := math.Pow10(dec)
	r := math.Round(v*p) / p
	if r == 0 {
		return 0
	}
	return r
}

func formatNumber(v float64, dec int) string {
	if math.Abs(v) >= 1_000_000 {
		exp := int(math.Floor(math.Log10(math.Abs(v))))
		mant := roundDec(v/math.Pow10(exp), 2)
		ms := strings.TrimRight(strings.TrimRight(strconv.FormatFloat(mant, 'f', 2, 64), "0"), ".")
		return fmt.Sprintf(`%s \times 10^{%d}`, ms, exp)
	}
	if dec > 0 {
		return strconv.FormatFloat(roundDec(v, dec), 'f', dec, 64)
	}
	return strconv.FormatInt(int64(math.Round(v)), 10)
}

func formatOptionLatex(v float64, dec int, unit string) string {
	num := formatNumber(v, dec)
	u := strings.TrimSpace(unit)
	switch u {
	case "":
		return "$" + num + "$"
	case "deg", "°":
		return "$" + num + `^\circ$`
	case "%":
		return "$" + num + `\%$`
	case "in^3":
		return "$" + num + `\,\text{in.}^3$`
	case "in^4":
		return "$" + num + `\,\text{in.}^4$`
	case "m/s^2":
		return "$" + num + `\,\text{m/s}^2$`
	case "10^3 mm^4":
		return "$" + num + ` \times 10^3\,\text{mm}^4$`
	case "10^6 mm^4":
		return "$" + num + ` \times 10^6\,\text{mm}^4$`
	case "N·m":
		return "$" + num + `\,\text{N}\cdot\text{m}$`
	case "lb·ft":
		return "$" + num + `\,\text{lb}\cdot\text{ft}$`
	case "kip·in.":
		return "$" + num + `\,\text{kip}\cdot\text{in.}$`
	case "kg·m/s":
		return "$" + num + `\,\text{kg}\cdot\text{m/s}$`
	default:
		return "$" + num + `\,\text{` + u + `}$`
	}
}

func isLikelyNonNegative(unit, prompt string) bool {
	u := strings.TrimSpace(unit)
	switch u {
	case "kPa", "Pa", "MPa", "N", "kN", "lb", "m", "cm", "mm", "in.", "ft", "km",
		"s", "m/s", "km/h", "kg", "kg/m^3", "kJ", "GJ", "W", "kW", "in^3", "in^4",
		"10^3 mm^4", "10^6 mm^4", "N·m", "lb·ft", "kip·in.", "kg·m/s", "%":
		return true
	}
	lp := strings.ToLower(prompt)
	for _, kw := range []string{"magnitude", "volume", "area", "distance", "pressure", "force", "mass", "time", "speed", "height", "depth", "degree", "order", "rank"} {
		if strings.Contains(lp, kw) {
			return true
		}
	}
	return false
}

func buildCandidateValues(ans float64, dec, targetSlot int, nonNeg bool) []float64 {
	if ans == 0 {
		if nonNeg {
			return []float64{0, 1, 2, 3}
		}
		sets := [4][]float64{
			{0, 1, 2, 3},
			{-1, 0, 1, 2},
			{-2, -1, 0, 1},
			{-3, -2, -1, 0},
		}
		return sets[targetSlot]
	}

	if dec == 0 && math.Abs(ans) <= 15 {
		step := 1.0
		if math.Abs(ans) > 9 {
			step = 3.0
		} else if math.Abs(ans) > 4 {
			step = 2.0
		}
		below := targetSlot
		if nonNeg {
			minVal := 0.0
			if ans >= 1 {
				minVal = 1.0
			}
			maxBelow := int(math.Floor((ans - minVal) / step))
			if below > maxBelow {
				below = maxBelow
			}
		}
		vals := []float64{ans}
		seen := map[string]bool{formatNumber(ans, 0): true}
		for k := 1; k <= below; k++ {
			v := ans - float64(k)*step
			vals = append(vals, v)
			seen[formatNumber(v, 0)] = true
		}
		up := 1
		for len(vals) < 4 {
			v := ans + float64(up)*step
			if !seen[formatNumber(v, 0)] {
				vals = append(vals, v)
				seen[formatNumber(v, 0)] = true
			}
			up++
		}
		if ans < 0 && !seen[formatNumber(-ans, 0)] {
			vals[len(vals)-1] = -ans
		}
		return vals
	}

	patternsPos := [4][3]float64{
		{1.14, 1.32, 1.56},
		{0.78, 1.18, 1.42},
		{0.64, 0.84, 1.24},
		{0.52, 0.72, 0.86},
	}
	patternsNeg := [4][3]float64{
		{1.36, 1.18, -1.0},
		{1.22, 0.78, -1.0},
		{0.74, 0.54, -1.0},
		{1.42, 1.18, 0.76},
	}
	mults := patternsPos[targetSlot]
	if ans < 0 {
		mults = patternsNeg[targetSlot]
	}

	vals := []float64{ans}
	seen := map[string]bool{formatNumber(ans, dec): true}
	for _, m := range mults {
		v := roundDec(ans*m, dec)
		if nonNeg && v <= 0 {
			v = roundDec(math.Abs(ans)*(1.2+0.2*float64(len(vals))), dec)
		}
		if math.Abs(ans) >= 100000 && dec == 0 {
			v = math.Round(v/10000) * 10000
		} else if math.Abs(ans) >= 10000 && dec == 0 {
			v = math.Round(v/1000) * 1000
		}
		k := formatNumber(v, dec)
		if !seen[k] {
			seen[k] = true
			vals = append(vals, v)
		}
	}

	bump := math.Pow10(-dec) * 5
	if dec == 0 {
		bump = math.Max(1, math.Round(math.Abs(ans)*0.15))
	}
	for step := 1; len(vals) < 4; step++ {
		v := roundDec(ans+bump*float64(step), dec)
		k := formatNumber(v, dec)
		if !seen[k] {
			seen[k] = true
			vals = append(vals, v)
		}
	}
	return vals
}

// MatchSyntheticOption returns the matching SyntheticOption by ID, plus the
// correct option ID for grading feedback.
func MatchSyntheticOption(opts []SyntheticOption, selectedID *uuid.UUID) (chosen *SyntheticOption, correctID uuid.UUID) {
	for i := range opts {
		if opts[i].IsCorrect {
			correctID = opts[i].ID
		}
		if selectedID != nil && opts[i].ID == *selectedID {
			o := opts[i]
			chosen = &o
		}
	}
	return chosen, correctID
}

// MatchSyntheticByValue maps a persisted numeric_input back to its synthetic
// option ID when reviewing a previously submitted exam.
func MatchSyntheticByValue(opts []SyntheticOption, val float64, tolPct float64) *uuid.UUID {
	bestIdx := -1
	bestDiff := math.MaxFloat64
	for i, o := range opts {
		diff := math.Abs(o.Value - val)
		if diff < bestDiff {
			bestDiff = diff
			bestIdx = i
		}
	}
	if bestIdx < 0 {
		return nil
	}
	// Accept exact match or within tolerance of that option value
	allowed := math.Max(1e-6, math.Abs(opts[bestIdx].Value)*(math.Max(tolPct, 1.0)/100.0))
	if bestDiff <= allowed {
		id := opts[bestIdx].ID
		return &id
	}
	return nil
}

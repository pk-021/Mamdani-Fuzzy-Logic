# Mamdani Fuzzy Inference System (FIS) for Loan Approval

This project implements a complete Mamdani Fuzzy Inference System to automate loan approval decisions. This README breaks down the four core stages of the fuzzy logic pipeline, with direct references to the implementation in the codebase.

---

## 1. Fuzzification
**Concept:** Converting "crisp" numerical inputs (e.g., a Credit Score of 720) into "fuzzy" linguistic values (e.g., 0.8 "Good" and 0.2 "Excellent").

### How it works in the code:
- **Membership Functions:** We use **Trapezoidal** and **Triangular** functions to define the boundaries of linguistic terms.
- **Implementation:** See `src/fuzzy/fuzzy.ts`.
  - `trapezoidal(x, a, b, c, d)`: Calculates the degree of membership (0 to 1).
  - `fuzzify(value, variable)`: Maps a single number to a set of linguistic memberships.

**Example:**
A Credit Score of `680` might be mapped to:
- `Poor`: 0.0
- `Fair`: 0.4
- `Good`: 0.6
- `Excellent`: 0.0

---

## 2. Rule Inference
**Concept:** Evaluating a set of "IF-THEN" rules to determine how much each rule "fires" (Activation Level).

### How it works in the code:
- **Rule Base:** Defined in `src/core/mamdani.ts` as the `RULES` array.
- **Operators:** 
  - **AND (Min):** The activation is the minimum of all conditions.
  - **OR (Max):** The activation is the maximum of all conditions.
- **Implementation:** `runInference(fuzzifiedInputs)` in `src/core/mamdani.ts`.

**Example Rule (R1):**
`IF Credit Score is Excellent AND DTI Ratio is Low THEN Approved`
If `Excellent` is 0.2 and `Low` is 0.9, the rule activation is `min(0.2, 0.9) = 0.2`.

---

## 3. Aggregation & Implication
**Concept:** Combining the results of all active rules into a single fuzzy set for the output variable.

### Two Methods Supported:
1. **Max-Min (Clipping):** The output membership function is "clipped" at the activation level.
2. **Max-Product (Scaling):** The output membership function is "scaled" proportionally.

### How it works in the code:
- **Implementation:** `aggregate(...)` in `src/core/mamdani.ts`.
- **Logic:** For every point along the output range (0-100), we calculate the maximum membership value across all rules that fired.
- **Visualization:** See `src/ui/AggregationChart.tsx` which renders the combined area and individual rule outlines (labeled R1, R2, etc.).

---

## 4. Defuzzification
**Concept:** Converting the final aggregated fuzzy set back into a single "crisp" number (the Decision Score).

### Method: Centroid (Center of Gravity)
We calculate the geometric center of the area under the aggregated fuzzy curve.

### How it works in the code:
- **Implementation:** `defuzzifyCentroid(aggregated, outputVar)` in `src/core/mamdani.ts`.
- **Formula:** 
  `Score = Σ(x * μ(x)) / Σ(μ(x))`
  Where `x` is the score value and `μ(x)` is the membership value at that point.

**Result:** A final score between 0 and 100 that represents the system's confidence in the loan decision.

---

## Presentation Summary Table

| Step | Input | Output | Code Reference |
| :--- | :--- | :--- | :--- |
| **Fuzzification** | Crisp Number (e.g. 750) | Fuzzy Set (e.g. {Good: 0.2, Exc: 0.8}) | `fuzzy.ts` -> `fuzzify` |
| **Rule Inference** | Fuzzy Sets | Activation Levels (0.0 - 1.0) | `mamdani.ts` -> `runInference` |
| **Aggregation** | Activation Levels | Combined Fuzzy Shape | `mamdani.ts` -> `aggregate` |
| **Defuzzification** | Combined Fuzzy Shape | Final Crisp Score (e.g. 82.5) | `mamdani.ts` -> `defuzzifyCentroid` |

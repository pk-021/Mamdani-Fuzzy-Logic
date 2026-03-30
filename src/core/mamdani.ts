import { FuzzySet, FuzzyVariable, INPUT_VARIABLES, OUTPUT_VARIABLE, evaluateMembership } from "../fuzzy/fuzzy";

export interface RuleCondition {
  variable: string;
  membership: string;
}

export interface Rule {
  id: string;
  conditions: RuleCondition[];
  operator: 'AND' | 'OR';
  consequent: string; // Membership name of the output variable
}

export interface InferenceResult {
  ruleId: string;
  activation: number;
  consequent: string;
}

export const RULES: Rule[] = [
  {
    id: "R1",
    conditions: [
      { variable: "Credit Score", membership: "Excellent" },
      { variable: "DTI Ratio", membership: "Low" }
    ],
    operator: "AND",
    consequent: "Approved"
  },
  {
    id: "R2",
    conditions: [
      { variable: "Credit Score", membership: "Poor" }
    ],
    operator: "AND",
    consequent: "Rejected"
  },
  {
    id: "R3",
    conditions: [
      { variable: "Previous Defaults", membership: "Major" }
    ],
    operator: "AND",
    consequent: "Rejected"
  },
  {
    id: "R4",
    conditions: [
      { variable: "Annual Income", membership: "High" },
      { variable: "Employment History", membership: "Long-term" }
    ],
    operator: "AND",
    consequent: "Approved"
  },
  {
    id: "R5",
    conditions: [
      { variable: "DTI Ratio", membership: "High" },
      { variable: "LTV Ratio", membership: "Risky" }
    ],
    operator: "OR",
    consequent: "Rejected"
  },
  {
    id: "R6",
    conditions: [
      { variable: "Credit Score", membership: "Fair" },
      { variable: "Savings Liquidity", membership: "Sufficient" }
    ],
    operator: "AND",
    consequent: "Marginal"
  },
  {
    id: "R7",
    conditions: [
      { variable: "Annual Income", membership: "Middle" },
      { variable: "Employment History", membership: "Stable" }
    ],
    operator: "AND",
    consequent: "Marginal"
  },
  {
    id: "R8",
    conditions: [
      { variable: "Credit Score", membership: "Good" },
      { variable: "Previous Defaults", membership: "None" }
    ],
    operator: "AND",
    consequent: "Approved"
  },
  {
    id: "R9",
    conditions: [
      { variable: "Savings Liquidity", membership: "Low" },
      { variable: "Annual Income", membership: "Struggling" }
    ],
    operator: "AND",
    consequent: "Rejected"
  },
  {
    id: "R10",
    conditions: [
      { variable: "LTV Ratio", membership: "Conservative" },
      { variable: "Credit Score", membership: "Fair" }
    ],
    operator: "AND",
    consequent: "Marginal"
  }
];

export function runInference(fuzzifiedInputs: Record<string, FuzzySet>): InferenceResult[] {
  return RULES.map(rule => {
    const conditionValues = rule.conditions.map(c => {
      const variableFuzzySet = fuzzifiedInputs[c.variable];
      return variableFuzzySet ? variableFuzzySet[c.membership] : 0;
    });

    let activation = 0;
    if (rule.operator === 'AND') {
      activation = Math.min(...conditionValues);
    } else {
      activation = Math.max(...conditionValues);
    }

    return {
      ruleId: rule.id,
      activation,
      consequent: rule.consequent
    };
  });
}

export type InferenceMethod = 'max-min' | 'max-product';

export function aggregate(
  inferenceResults: InferenceResult[], 
  outputVar: FuzzyVariable, 
  method: InferenceMethod = 'max-min',
  resolution: number = 100
): number[] {
  const step = (outputVar.max - outputVar.min) / resolution;
  const aggregated = new Array(resolution + 1).fill(0);

  for (let i = 0; i <= resolution; i++) {
    const x = outputVar.min + i * step;
    
    // For each point x, the aggregated membership is the max of all activated consequents
    let maxMembership = 0;
    inferenceResults.forEach(res => {
      if (res.activation > 0) {
        const mf = outputVar.memberships.find(m => m.name === res.consequent);
        if (mf) {
          const membership = evaluateMembership(x, mf);
          // Implication: 
          // max-min: min(activation, membership)
          // max-product: activation * membership
          const implied = method === 'max-min' 
            ? Math.min(res.activation, membership)
            : res.activation * membership;
          
          maxMembership = Math.max(maxMembership, implied);
        }
      }
    });
    aggregated[i] = maxMembership;
  }

  return aggregated;
}

export function defuzzifyCentroid(aggregated: number[], outputVar: FuzzyVariable): number {
  const resolution = aggregated.length - 1;
  const step = (outputVar.max - outputVar.min) / resolution;
  
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i <= resolution; i++) {
    const x = outputVar.min + i * step;
    numerator += x * aggregated[i];
    denominator += aggregated[i];
  }

  if (denominator === 0) return (outputVar.max + outputVar.min) / 2;
  return numerator / denominator;
}

export type FuzzySet = Record<string, number>;

export interface MembershipFunction {
  name: string;
  type: 'triangular' | 'trapezoidal';
  params: number[];
}

export interface FuzzyVariable {
  name: string;
  min: number;
  max: number;
  unit?: string;
  memberships: MembershipFunction[];
}

// Trapezoidal membership function
export function trapezoidal(x: number, a: number, b: number, c: number, d: number): number {
  if (x < a || x > d) return 0;
  if (x >= b && x <= c) return 1;
  if (a < b && x >= a && x < b) return (x - a) / (b - a);
  if (c < d && x > c && x <= d) return (d - x) / (d - c);
  return 0;
}

// Triangular membership function
export function triangular(x: number, a: number, b: number, c: number): number {
  return trapezoidal(x, a, b, b, c);
}

export function evaluateMembership(x: number, mf: MembershipFunction): number {
  if (mf.type === 'triangular') {
    return triangular(x, mf.params[0], mf.params[1], mf.params[2]);
  } else {
    return trapezoidal(x, mf.params[0], mf.params[1], mf.params[2], mf.params[3]);
  }
}

export const INPUT_VARIABLES: FuzzyVariable[] = [
  {
    name: "Credit Score",
    min: 300,
    max: 850,
    memberships: [
      { name: "Poor", type: "trapezoidal", params: [300, 300, 550, 600] },
      { name: "Fair", type: "trapezoidal", params: [550, 600, 650, 700] },
      { name: "Good", type: "trapezoidal", params: [650, 700, 730, 760] },
      { name: "Excellent", type: "trapezoidal", params: [730, 760, 850, 850] }
    ]
  },
  {
    name: "DTI Ratio",
    min: 0,
    max: 100,
    unit: "%",
    memberships: [
      { name: "Low", type: "trapezoidal", params: [0, 0, 15, 25] },
      { name: "Moderate", type: "trapezoidal", params: [15, 25, 35, 45] },
      { name: "High", type: "trapezoidal", params: [35, 45, 100, 100] }
    ]
  },
  {
    name: "Annual Income",
    min: 0,
    max: 200000,
    unit: "$",
    memberships: [
      { name: "Struggling", type: "trapezoidal", params: [0, 0, 25000, 40000] },
      { name: "Middle", type: "trapezoidal", params: [25000, 40000, 80000, 120000] },
      { name: "High", type: "trapezoidal", params: [80000, 120000, 200000, 200000] }
    ]
  },
  {
    name: "Employment History",
    min: 0,
    max: 30,
    unit: "yrs",
    memberships: [
      { name: "Unstable", type: "trapezoidal", params: [0, 0, 1, 2] },
      { name: "Stable", type: "trapezoidal", params: [1, 2, 4, 6] },
      { name: "Long-term", type: "trapezoidal", params: [4, 6, 30, 30] }
    ]
  },
  {
    name: "LTV Ratio",
    min: 0,
    max: 100,
    unit: "%",
    memberships: [
      { name: "Conservative", type: "trapezoidal", params: [0, 0, 70, 85] },
      { name: "Risky", type: "trapezoidal", params: [70, 85, 100, 100] }
    ]
  },
  {
    name: "Savings Liquidity",
    min: 0,
    max: 100000,
    unit: "$",
    memberships: [
      { name: "Low", type: "trapezoidal", params: [0, 0, 2000, 5000] },
      { name: "Sufficient", type: "trapezoidal", params: [2000, 5000, 15000, 25000] },
      { name: "Surplus", type: "trapezoidal", params: [15000, 25000, 100000, 100000] }
    ]
  },
  {
    name: "Previous Defaults",
    min: 0,
    max: 10,
    memberships: [
      { name: "None", type: "trapezoidal", params: [0, 0, 0, 0.5] },
      { name: "Minor", type: "trapezoidal", params: [0, 0.5, 1, 2] },
      { name: "Major", type: "trapezoidal", params: [1, 2, 10, 10] }
    ]
  }
];

export const OUTPUT_VARIABLE: FuzzyVariable = {
  name: "Approval Score",
  min: 0,
  max: 100,
  memberships: [
    { name: "Rejected", type: "trapezoidal", params: [0, 0, 20, 40] },
    { name: "Marginal", type: "trapezoidal", params: [20, 40, 60, 80] },
    { name: "Approved", type: "trapezoidal", params: [60, 80, 100, 100] }
  ]
};

export interface CrispInput {
  creditScore: number;
  dti: number;
  income: number;
  employment: number;
  ltv: number;
  savings: number;
  defaults: number;
}

export function fuzzify(value: number, variable: FuzzyVariable): FuzzySet {
  const result: FuzzySet = {};
  variable.memberships.forEach(mf => {
    result[mf.name] = evaluateMembership(value, mf);
  });
  return result;
}

export function fuzzifyAll(input: CrispInput): Record<string, FuzzySet> {
  const result: Record<string, FuzzySet> = {};
  
  const mapping: Record<string, keyof CrispInput> = {
    "Credit Score": "creditScore",
    "DTI Ratio": "dti",
    "Annual Income": "income",
    "Employment History": "employment",
    "LTV Ratio": "ltv",
    "Savings Liquidity": "savings",
    "Previous Defaults": "defaults"
  };

  INPUT_VARIABLES.forEach(v => {
    const key = mapping[v.name];
    if (key) {
      result[v.name] = fuzzify(input[key], v);
    }
  });

  return result;
}

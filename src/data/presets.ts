import { CrispInput } from "../fuzzy/fuzzy";

export const PRESETS: Record<string, CrispInput> = {
  "Ideal Candidate": {
    creditScore: 800,
    dti: 10,
    income: 150000,
    employment: 10,
    ltv: 60,
    savings: 50000,
    defaults: 0
  },
  "High Risk": {
    creditScore: 550,
    dti: 50,
    income: 25000,
    employment: 0.5,
    ltv: 95,
    savings: 1000,
    defaults: 3
  },
  "Young Professional": {
    creditScore: 720,
    dti: 25,
    income: 85000,
    employment: 2,
    ltv: 90,
    savings: 15000,
    defaults: 0
  },
  "Struggling Entrepreneur": {
    creditScore: 620,
    dti: 45,
    income: 45000,
    employment: 1,
    ltv: 85,
    savings: 5000,
    defaults: 1
  },
  "Wealthy Retiree": {
    creditScore: 820,
    dti: 5,
    income: 60000,
    employment: 0,
    ltv: 40,
    savings: 250000,
    defaults: 0
  },
  "Average Citizen": {
    creditScore: 680,
    dti: 35,
    income: 65000,
    employment: 5,
    ltv: 80,
    savings: 12000,
    defaults: 0
  }
};

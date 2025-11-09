// src/types/Survey.ts

export type Budget = 'low' | 'mid-low' | 'mid' | 'high' | undefined;
export type Repair = 'ศูนย์' | 'อู่' | 'both' | undefined;
export type Coverage = 'all' | 'car' | 'fire' | 'basic';
export type Usage = 'low' | 'mid' | 'high' | undefined;
export type Accident = 'never' | 'rare' | 'sometimes' | 'often' | undefined;

export interface InsuranceAnswers {
  budget: Budget;
  repair: Repair;
  coverage: Coverage[];
  usage: Usage;
  accident: Accident;
}

// *********** เพิ่มโค้ดส่วนนี้ ***********
export const initialAnswers: InsuranceAnswers = {
  budget: undefined,
  repair: undefined,
  coverage: [],
  usage: undefined,
  accident: undefined,
};
// ****************************************
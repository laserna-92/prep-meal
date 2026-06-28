/**
 * Nutrition math — Mifflin-St Jeor BMR/TDEE and macro targets.
 * Implements the business rules in docs/01-product-design.md §7.
 * Pure functions: same inputs → same output, no side effects.
 */
import type { ActivityLevel, Goal, GoalPace, NutritionTarget, Sex } from '@/types/models';

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

// Calorie adjustment as a fraction of TDEE, by goal + pace.
const GOAL_ADJUSTMENT: Record<Goal, Record<GoalPace, number>> = {
  cut: { slow: -0.1, moderate: -0.18, aggressive: -0.25 },
  maintain: { slow: 0, moderate: 0, aggressive: 0 },
  bulk: { slow: 0.08, moderate: 0.12, aggressive: 0.18 },
};

// Protein target in g/kg of bodyweight; upper end for cut / strength training.
const PROTEIN_PER_KG: Record<Goal, number> = {
  cut: 2.2,
  maintain: 1.8,
  bulk: 2.0,
};

const FAT_PER_KG = 0.8; // minimum hormonal floor (docs/01 §7)

export interface MacroInput {
  sex: Sex;
  ageYears: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
  goalPace: GoalPace;
}

/** Mifflin-St Jeor basal metabolic rate (kcal/day). */
export function calcBmr(input: Pick<MacroInput, 'sex' | 'ageYears' | 'heightCm' | 'weightKg'>): number {
  const { weightKg, heightCm, ageYears, sex } = input;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return Math.round(base + (sex === 'male' ? 5 : -161));
}

/** Total daily energy expenditure (kcal/day). */
export function calcTdee(bmr: number, activity: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_FACTOR[activity]);
}

/** Age in whole years from an ISO birth date, relative to `today`. */
export function ageFromBirthDate(birthDate: string, today: Date): number {
  const b = new Date(birthDate);
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age;
}

/**
 * Full target: BMR → TDEE → calorie goal → macro split.
 * Protein and fat are anchored to bodyweight; carbs fill the remainder.
 */
export function calcTarget(input: MacroInput): NutritionTarget {
  const bmr = calcBmr(input);
  const tdee = calcTdee(bmr, input.activity);
  const calories = Math.round(tdee * (1 + GOAL_ADJUSTMENT[input.goal][input.goalPace]));

  const proteinG = Math.round(PROTEIN_PER_KG[input.goal] * input.weightKg);
  const fatG = Math.round(FAT_PER_KG * input.weightKg);

  const proteinKcal = proteinG * 4;
  const fatKcal = fatG * 9;
  const carbsG = Math.max(0, Math.round((calories - proteinKcal - fatKcal) / 4));

  const pct = (input.goal === 'cut' ? '-' : input.goal === 'bulk' ? '+' : '') +
    Math.abs(Math.round(GOAL_ADJUSTMENT[input.goal][input.goalPace] * 100)) + '%';

  return {
    bmr,
    tdee,
    calories,
    proteinG,
    carbsG,
    fatG,
    source: 'mifflin_st_jeor',
    rationale:
      `${input.goal} ${input.goalPace} (${pct} TDEE); ` +
      `proteína ${PROTEIN_PER_KG[input.goal]} g/kg; gordura ${FAT_PER_KG} g/kg; HC restante`,
  };
}

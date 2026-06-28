/**
 * Modo Cozinha (batch cooking) — optimized routine + tupperware labels (docs/05 §7).
 */
import { supabase } from '@/lib/supabase';
import type { Macros, MealSlot } from '@/types/models';

export type CookTechnique = 'oven' | 'stove' | 'prep' | 'rest' | 'assemble';

export interface CookStep {
  order: number;
  instruction: string;
  durationMin: number;
  technique: CookTechnique;
  parallel: boolean;
}

export interface CookLabel {
  meal: string;
  day: number;
  slot?: MealSlot;
  macros: Macros;
  useByDate: string;
}

export interface CookPlan {
  estimateMinutes: number;
  containers: number;
  timeline: CookStep[];
  labels: CookLabel[];
}

/** Build the optimized cooking routine for the selected planned meals. */
export async function getCookPlan(planId: string, mealIds: string[]): Promise<CookPlan> {
  const { data, error } = await supabase.rpc('cook_plan', { p_plan: planId, p_meal_ids: mealIds });
  if (error) throw error;
  return data as CookPlan;
}

/** Mark the prepared meals as ready. Returns the number updated. */
export async function completeCookPlan(mealIds: string[]): Promise<number> {
  const { data, error } = await supabase.rpc('cook_plan_complete', { p_meal_ids: mealIds });
  if (error) throw error;
  return data as number;
}

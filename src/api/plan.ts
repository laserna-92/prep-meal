/**
 * Weekly plan: generation (RPC) and reading the current plan mapped to the
 * client MealPlan shape (docs/05).
 */
import { supabase } from '@/lib/supabase';
import { ensureSession } from './auth';
import type { MealPlan, PlanDay, PlannedMeal, Macros, MealSlot, MealStatus, RecipeSummary } from '@/types/models';

/** Generate (or replace) the plan for a given week. Returns the plan id. */
export async function generatePlan(weekStart: string, variety: 'simple' | 'balanced' | 'high' = 'balanced') {
  await ensureSession();
  const { data, error } = await supabase.rpc('generate_meal_plan', {
    p_week_start: weekStart,
    p_variety: variety,
  });
  if (error) throw error;
  return data as string;
}

/** Swap alternatives for a planned meal (same slot, closest calories). */
export async function getAlternatives(mealId: string, limit = 3): Promise<RecipeSummary[]> {
  const { data, error } = await supabase.rpc('meal_alternatives', { p_meal: mealId, p_limit: limit });
  if (error) throw error;
  return ((data ?? []) as any[]).map((r) => ({
    id: r.id,
    title: r.title,
    imageUrl: r.image_url ?? undefined,
    perServing: { calories: r.kcal_per_serv, proteinG: r.protein_per_serv },
    prepMinutes: r.prep_minutes,
    isPrepFriendly: r.is_prep_friendly,
  }));
}

/** Replace a meal's recipe (servings auto-rescaled server-side). */
export async function swapMeal(mealId: string, recipeId: string) {
  const { error } = await supabase.rpc('swap_meal', { p_meal: mealId, p_recipe: recipeId });
  if (error) throw error;
}

/** Confirm a plan and build its shopping list. Returns the shopping list id. */
export async function confirmPlan(planId: string, people = 1) {
  const { data, error } = await supabase.rpc('confirm_plan', { p_plan: planId, p_people: people });
  if (error) throw error;
  return data as string;
}

type PlannedMealRow = {
  id: string;
  slot: MealSlot;
  day_of_week: number;
  servings: number;
  status: MealStatus;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  recipes: {
    id: string;
    title: string;
    image_url: string | null;
    kcal_per_serv: number;
    protein_per_serv: number;
    prep_minutes: number;
    is_prep_friendly: boolean;
  } | null;
};

const zero: Macros = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };
const addMacros = (a: Macros, b: Macros): Macros => ({
  calories: a.calories + b.calories,
  proteinG: a.proteinG + b.proteinG,
  carbsG: a.carbsG + b.carbsG,
  fatG: a.fatG + b.fatG,
});

/** Most recent plan for the signed-in user, or null if none exists. */
export async function getCurrentPlan(): Promise<MealPlan | null> {
  const { data, error } = await supabase
    .from('meal_plans')
    .select(
      `id, week_start, status, target_snapshot,
       planned_meals (
         id, slot, day_of_week, servings, status, kcal, protein_g, carbs_g, fat_g,
         recipes ( id, title, image_url, kcal_per_serv, protein_per_serv, prep_minutes, is_prep_friendly )
       )`,
    )
    .order('week_start', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const rows = (data.planned_meals ?? []) as unknown as PlannedMealRow[];

  const byDay = new Map<number, PlannedMeal[]>();
  for (const row of rows) {
    if (!row.recipes) continue;
    const meal: PlannedMeal = {
      id: row.id,
      slot: row.slot,
      dayOfWeek: row.day_of_week,
      servings: Number(row.servings),
      status: row.status,
      macros: { calories: row.kcal, proteinG: row.protein_g, carbsG: row.carbs_g, fatG: row.fat_g },
      recipe: {
        id: row.recipes.id,
        title: row.recipes.title,
        imageUrl: row.recipes.image_url ?? undefined,
        perServing: { calories: row.recipes.kcal_per_serv, proteinG: row.recipes.protein_per_serv },
        prepMinutes: row.recipes.prep_minutes,
        isPrepFriendly: row.recipes.is_prep_friendly,
      },
    };
    const list = byDay.get(row.day_of_week) ?? [];
    list.push(meal);
    byDay.set(row.day_of_week, list);
  }

  const days: PlanDay[] = [...byDay.entries()]
    .sort(([a], [b]) => a - b)
    .map(([dayOfWeek, meals]) => ({
      dayOfWeek,
      totals: meals.reduce((acc, m) => addMacros(acc, m.macros), zero),
      meals: meals.sort((a, b) => a.slot.localeCompare(b.slot)),
    }));

  return {
    id: data.id,
    weekStart: data.week_start,
    status: data.status,
    targetSnapshot: data.target_snapshot as Macros,
    days,
  };
}

/**
 * Mock data for the scaffold — lets screens render before the API exists.
 * Replace with Supabase / Edge Function calls (see docs/05-api-contract.md).
 */
import type { MealPlan, Macros, PlannedMeal } from '@/types/models';

export const mockTarget: Macros = { calories: 2650, proteinG: 185, carbsG: 320, fatG: 70 };

export const mockConsumedToday: Macros = { calories: 1480, proteinG: 120, carbsG: 180, fatG: 40 };

export const mockTodayMeals: PlannedMeal[] = [
  {
    id: 'pm_1',
    slot: 'breakfast',
    dayOfWeek: 0,
    servings: 1,
    status: 'eaten',
    macros: { calories: 480, proteinG: 30, carbsG: 45, fatG: 18 },
    recipe: { id: 'r_1', title: 'Ovos mexidos + aveia', perServing: { calories: 480, proteinG: 30 }, prepMinutes: 10, isPrepFriendly: true },
  },
  {
    id: 'pm_2',
    slot: 'lunch',
    dayOfWeek: 0,
    servings: 1,
    status: 'ready',
    macros: { calories: 720, proteinG: 52, carbsG: 80, fatG: 14 },
    recipe: { id: 'r_2', title: 'Frango teriyaki + arroz', perServing: { calories: 720, proteinG: 52 }, prepMinutes: 25, isPrepFriendly: true },
  },
  {
    id: 'pm_3',
    slot: 'snack',
    dayOfWeek: 0,
    servings: 1,
    status: 'planned',
    macros: { calories: 320, proteinG: 30, carbsG: 35, fatG: 6 },
    recipe: { id: 'r_3', title: 'Batido proteico + banana', perServing: { calories: 320, proteinG: 30 }, prepMinutes: 3, isPrepFriendly: false },
  },
  {
    id: 'pm_4',
    slot: 'dinner',
    dayOfWeek: 0,
    servings: 1,
    status: 'planned',
    macros: { calories: 540, proteinG: 48, carbsG: 30, fatG: 22 },
    recipe: { id: 'r_4', title: 'Salmão + legumes assados', perServing: { calories: 540, proteinG: 48 }, prepMinutes: 20, isPrepFriendly: true },
  },
];

export const mockPlan: MealPlan = {
  id: 'plan_1',
  weekStart: '2026-06-29',
  status: 'confirmed',
  targetSnapshot: mockTarget,
  weekSummary: { avgCalories: 2638, proteinAdherence: 0.97, estCost: 58.2 },
  days: Array.from({ length: 7 }, (_, day) => ({
    dayOfWeek: day,
    totals: mockTarget,
    meals: mockTodayMeals.map((m) => ({ ...m, dayOfWeek: day, status: 'planned' as const })),
  })),
};

/**
 * Mock data for the scaffold — lets screens render before the API exists.
 * Replace with Supabase / Edge Function calls (see docs/05-api-contract.md).
 */
import type { MealPlan, Macros, PlannedMeal, RecipeSummary } from '@/types/models';

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

export const mockAlternatives: RecipeSummary[] = [
  { id: 'r_5', title: 'Peru + batata-doce assada', perServing: { calories: 523, proteinG: 55 }, prepMinutes: 10, isPrepFriendly: true },
  { id: 'r_6', title: 'Bowl de peru + arroz', perServing: { calories: 575, proteinG: 54 }, prepMinutes: 10, isPrepFriendly: true },
  { id: 'r_7', title: 'Atum + massa', perServing: { calories: 501, proteinG: 42 }, prepMinutes: 5, isPrepFriendly: true },
];

export const mockShoppingList = {
  id: 'sl_mock',
  people: 1,
  estTotal: 58.2,
  aisles: [
    { aisle: 'produce' as const, items: [
      { id: 'si_1', name: 'Brócolos', quantity: 600, unit: 'g', aisle: 'produce' as const, estPrice: 1.8, haveAtHome: false, checked: false },
      { id: 'si_2', name: 'Cenoura', quantity: 500, unit: 'g', aisle: 'produce' as const, estPrice: 0.9, haveAtHome: false, checked: false },
    ] },
    { aisle: 'butcher' as const, items: [
      { id: 'si_3', name: 'Peito de frango', quantity: 1400, unit: 'g', aisle: 'butcher' as const, estPrice: 12.6, haveAtHome: false, checked: false },
    ] },
    { aisle: 'dairy' as const, items: [
      { id: 'si_4', name: 'Ovos', quantity: 18, unit: 'un', aisle: 'dairy' as const, estPrice: 4.5, haveAtHome: true, checked: false },
    ] },
    { aisle: 'grocery' as const, items: [
      { id: 'si_5', name: 'Arroz', quantity: 1000, unit: 'g', aisle: 'grocery' as const, estPrice: 2.0, haveAtHome: false, checked: false },
      { id: 'si_6', name: 'Aveia', quantity: 500, unit: 'g', aisle: 'grocery' as const, estPrice: 1.5, haveAtHome: false, checked: false },
    ] },
  ],
};

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

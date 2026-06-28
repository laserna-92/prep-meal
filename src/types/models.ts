/**
 * Shared domain types — transport (camelCase) mirror of docs/04 data model
 * and docs/05 API schemas. Keep in sync with the database enums.
 */

export type Goal = 'cut' | 'maintain' | 'bulk';
export type GoalPace = 'slow' | 'moderate' | 'aggressive';
export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
export type Diet = 'omnivore' | 'vegetarian' | 'vegan' | 'low_carb' | 'mediterranean';
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type PlanStatus = 'draft' | 'confirmed' | 'archived';
export type MealStatus = 'planned' | 'ready' | 'eaten' | 'skipped';
export type Aisle = 'produce' | 'butcher' | 'fish' | 'dairy' | 'grocery' | 'frozen' | 'bakery' | 'other';

export interface Macros {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface NutritionTarget extends Macros {
  bmr: number;
  tdee: number;
  rationale?: string;
  source?: string;
}

export interface Profile {
  sex: Sex;
  birthDate: string;
  heightCm: number;
  weightKg: number;
  bodyFatPct?: number;
  activity: ActivityLevel;
  workoutsPerWeek: number;
  goal: Goal;
  goalPace: GoalPace;
  diet: Diet;
  allergies: string[];
  avoid: string[];
  favoritesTags: string[];
  mealsPerDay: number;
  prepDays: number[];
  prepMinutes?: number;
  equipment: string[];
  skillLevel: number;
  budgetWeekly?: number;
  unitSystem: 'metric' | 'imperial';
  energyUnit: 'kcal' | 'kj';
}

export interface RecipeSummary {
  id: string;
  title: string;
  imageUrl?: string;
  perServing: Pick<Macros, 'calories' | 'proteinG'> & Partial<Macros>;
  prepMinutes: number;
  isPrepFriendly: boolean;
  isFavorite?: boolean;
}

export interface PlannedMeal {
  id: string;
  slot: MealSlot;
  dayOfWeek: number;
  recipe: RecipeSummary;
  servings: number;
  macros: Macros;
  status: MealStatus;
}

export interface PlanDay {
  dayOfWeek: number;
  totals: Macros;
  meals: PlannedMeal[];
}

export interface MealPlan {
  id: string;
  weekStart: string;
  status: PlanStatus;
  targetSnapshot: Macros;
  days: PlanDay[];
  weekSummary?: { avgCalories: number; proteinAdherence: number; estCost: number };
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  aisle: Aisle;
  estPrice?: number;
  haveAtHome: boolean;
  checked: boolean;
}

/**
 * Profile + nutrition target persistence (Flow A).
 * Maps the camelCase onboarding draft to the snake_case schema (docs/04).
 */
import { supabase } from '@/lib/supabase';
import { ensureSession } from './auth';
import type { NutritionTarget } from '@/types/models';
import type { OnboardingDraft } from '@/state/onboarding';

/** Persist the onboarding profile and activate a fresh nutrition target. */
export async function saveProfileAndTarget(draft: OnboardingDraft, target: NutritionTarget) {
  const session = await ensureSession();
  const uid = session!.user.id;

  const { error: pErr } = await supabase.from('profiles').upsert({
    id: uid,
    sex: draft.sex,
    birth_date: draft.birthDate,
    height_cm: draft.heightCm,
    weight_kg: draft.weightKg,
    activity: draft.activity,
    workouts_per_wk: draft.workoutsPerWeek,
    goal: draft.goal,
    goal_pace: draft.goalPace,
    meals_per_day: draft.mealsPerDay,
  });
  if (pErr) throw pErr;

  // Only one active target per user (enforced by a partial unique index):
  // deactivate any current one before inserting the new active row.
  const { error: dErr } = await supabase
    .from('nutrition_targets')
    .update({ is_active: false })
    .eq('user_id', uid)
    .eq('is_active', true);
  if (dErr) throw dErr;

  const { error: tErr } = await supabase.from('nutrition_targets').insert({
    user_id: uid,
    calories: target.calories,
    protein_g: target.proteinG,
    carbs_g: target.carbsG,
    fat_g: target.fatG,
    bmr: target.bmr,
    tdee: target.tdee,
    is_active: true,
  });
  if (tErr) throw tErr;
}

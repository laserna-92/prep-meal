/**
 * Onboarding draft store — collects answers across the wizard and derives the
 * nutrition target. Minimal React context store (swap for Zustand if it grows).
 */
import React, { createContext, useContext, useMemo, useState } from 'react';
import { calcTarget, ageFromBirthDate } from '@/lib/nutrition';
import type { ActivityLevel, Goal, GoalPace, NutritionTarget, Sex } from '@/types/models';

export interface OnboardingDraft {
  goal: Goal;
  goalPace: GoalPace;
  sex: Sex;
  birthDate: string; // ISO
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  workoutsPerWeek: number;
  mealsPerDay: number;
}

const DEFAULT_DRAFT: OnboardingDraft = {
  goal: 'bulk',
  goalPace: 'moderate',
  sex: 'male',
  birthDate: '2000-01-01',
  heightCm: 178,
  weightKg: 80,
  activity: 'moderate',
  workoutsPerWeek: 5,
  mealsPerDay: 4,
};

interface OnboardingContextValue {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
  target: NutritionTarget;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(DEFAULT_DRAFT);

  const update = (patch: Partial<OnboardingDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const target = useMemo<NutritionTarget>(
    () =>
      calcTarget({
        sex: draft.sex,
        ageYears: ageFromBirthDate(draft.birthDate, new Date('2026-06-28')),
        heightCm: draft.heightCm,
        weightKg: draft.weightKg,
        activity: draft.activity,
        goal: draft.goal,
        goalPace: draft.goalPace,
      }),
    [draft],
  );

  return (
    <OnboardingContext.Provider value={{ draft, update, target }}>{children}</OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within <OnboardingProvider>');
  return ctx;
}

import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { MacroRing } from '@/components/ui/MacroRing';
import { MealCard } from '@/components/MealCard';
import { useTheme } from '@/theme';
import { mockTarget, mockTodayMeals } from '@/lib/mock';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getCurrentPlan } from '@/api/plan';
import { weekdayIndex } from '@/lib/dates';
import type { Macros, PlannedMeal } from '@/types/models';

const EMPTY: Macros = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };

export default function Today() {
  const theme = useTheme();
  const [meals, setMeals] = useState<PlannedMeal[]>(isSupabaseConfigured ? [] : mockTodayMeals);
  const [target, setTarget] = useState<Macros>(mockTarget);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    (async () => {
      try {
        const plan = await getCurrentPlan();
        if (!active) return;
        if (plan) {
          setTarget(plan.targetSnapshot);
          const today = plan.days.find((d) => d.dayOfWeek === weekdayIndex()) ?? plan.days[0];
          setMeals(today?.meals ?? []);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const consumed = useMemo<Macros>(
    () =>
      meals
        .filter((m) => m.status === 'eaten')
        .reduce(
          (acc, m) => ({
            calories: acc.calories + m.macros.calories,
            proteinG: acc.proteinG + m.macros.proteinG,
            carbsG: acc.carbsG + m.macros.carbsG,
            fatG: acc.fatG + m.macros.fatG,
          }),
          EMPTY,
        ),
    [meals],
  );

  const eat = (id: string) =>
    setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'eaten' } : m)));

  return (
    <Screen>
      <Text variant="h1">Hoje</Text>

      <Card>
        <Text variant="label" color="secondary">
          Macros do dia
        </Text>
        <MacroRing consumed={consumed} target={target} />
      </Card>

      <View style={{ gap: theme.space[3] }}>
        <Text variant="h2">As tuas refeições</Text>
        {loading && (
          <Text variant="body" color="secondary">
            A carregar o teu plano…
          </Text>
        )}
        {!loading && meals.length === 0 && (
          <Text variant="body" color="secondary">
            Sem plano ainda. Gera um no separador Plano.
          </Text>
        )}
        {meals.map((meal) => (
          <MealCard key={meal.id} meal={meal} onEat={() => eat(meal.id)} onSwap={() => {}} />
        ))}
      </View>
    </Screen>
  );
}

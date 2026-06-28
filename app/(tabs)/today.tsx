import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { MacroRing } from '@/components/ui/MacroRing';
import { MealCard } from '@/components/MealCard';
import { useTheme } from '@/theme';
import { mockTarget, mockTodayMeals } from '@/lib/mock';
import type { Macros, PlannedMeal } from '@/types/models';

export default function Today() {
  const theme = useTheme();
  const [meals, setMeals] = useState<PlannedMeal[]>(mockTodayMeals);

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
          { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
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
        <MacroRing consumed={consumed} target={mockTarget} />
      </Card>

      <View style={{ gap: theme.space[3] }}>
        <Text variant="h2">As tuas refeições</Text>
        {meals.map((meal) => (
          <MealCard key={meal.id} meal={meal} onEat={() => eat(meal.id)} onSwap={() => {}} />
        ))}
      </View>
    </Screen>
  );
}

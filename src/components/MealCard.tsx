/**
 * MealCard — used in Today/Plan (docs/03 §3.4). Shows recipe, macros and a
 * status badge; exposes "eat" and "swap" inline actions.
 */
import React from 'react';
import { View } from 'react-native';
import { Card } from './ui/Card';
import { Text } from './ui/Text';
import { Button } from './ui/Button';
import { useTheme } from '@/theme';
import type { PlannedMeal } from '@/types/models';

const SLOT_LABEL: Record<PlannedMeal['slot'], string> = {
  breakfast: 'Peq-almoço',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Snack',
};

export interface MealCardProps {
  meal: PlannedMeal;
  onEat?: () => void;
  onSwap?: () => void;
}

export function MealCard({ meal, onEat, onSwap }: MealCardProps) {
  const theme = useTheme();
  const { macros, recipe, status } = meal;
  const ready = status === 'ready';
  const eaten = status === 'eaten';

  return (
    <Card style={eaten ? { opacity: 0.6 } : undefined}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="label" color="secondary">
          {SLOT_LABEL[meal.slot]}
        </Text>
        {ready && (
          <Text variant="label" style={{ color: theme.feedback.success }}>
            ✅ pronto
          </Text>
        )}
        {eaten && (
          <Text variant="label" color="secondary">
            ✓ comido
          </Text>
        )}
      </View>

      <Text variant="h3">{recipe.title}</Text>
      <Text variant="caption" color="secondary" tabular>
        {macros.calories} kcal · {macros.proteinG}P/{macros.carbsG}C/{macros.fatG}G
      </Text>

      {!eaten && (
        <View style={{ flexDirection: 'row', gap: theme.space[2] }}>
          <Button label="Marcar comido" size="sm" onPress={onEat} fullWidth={false} style={{ flex: 1 }} />
          <Button label="Trocar" size="sm" variant="secondary" onPress={onSwap} fullWidth={false} style={{ flex: 1 }} />
        </View>
      )}
    </Card>
  );
}

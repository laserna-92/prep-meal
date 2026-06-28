import React from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/theme';
import { mockTodayMeals } from '@/lib/mock';

export default function Recipes() {
  const theme = useTheme();
  const recipes = mockTodayMeals.map((m) => m.recipe);

  return (
    <Screen>
      <Text variant="h1">Receitas</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[3] }}>
        {recipes.map((r) => (
          <Card key={r.id} style={{ width: '47%' }}>
            <Text variant="h3">{r.title}</Text>
            <Text variant="caption" color="secondary" tabular>
              {r.perServing.proteinG}P · {r.perServing.calories} kcal
            </Text>
            <Text variant="caption" color="secondary">
              {r.prepMinutes} min {r.isPrepFriendly ? '· prep-friendly' : ''}
            </Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

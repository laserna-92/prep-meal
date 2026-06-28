import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme';
import { mockPlan } from '@/lib/mock';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const SLOT_LABEL: Record<string, string> = {
  breakfast: 'Peq-almoço',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Snack',
};

export default function Plan() {
  const theme = useTheme();
  const [activeDay, setActiveDay] = useState(0);
  const day = mockPlan.days[activeDay];

  return (
    <Screen>
      <Text variant="h1">Plano</Text>
      <Text variant="caption" color="secondary">
        Semana de {mockPlan.weekStart}
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {DAYS.map((d, i) => {
          const selected = i === activeDay;
          return (
            <Pressable
              key={d}
              onPress={() => setActiveDay(i)}
              style={{
                paddingVertical: theme.space[2],
                paddingHorizontal: theme.space[2],
                borderRadius: theme.radius.md,
                backgroundColor: selected ? theme.colors.brand : 'transparent',
              }}
            >
              <Text variant="label" style={{ color: selected ? theme.colors.brandContrast : theme.colors.textSecondary }}>
                {d}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Card>
        {day.meals.map((m) => (
          <View
            key={m.id}
            style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.space[2] }}
          >
            <View style={{ flex: 1 }}>
              <Text variant="label" color="secondary">
                {SLOT_LABEL[m.slot]}
              </Text>
              <Text variant="h3">{m.recipe.title}</Text>
            </View>
            <Text variant="caption" color="secondary" tabular>
              {m.macros.calories} kcal
            </Text>
          </View>
        ))}
      </Card>

      <Button label="🛒 Lista de compras" variant="secondary" onPress={() => {}} />
      <Button label="⟳ Regenerar semana" onPress={() => {}} />
    </Screen>
  );
}

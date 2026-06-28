import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MacroRing } from '@/components/ui/MacroRing';
import { useOnboarding } from '@/state/onboarding';
import { useTheme } from '@/theme';

const EMPTY = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };

export default function SummaryStep() {
  const router = useRouter();
  const theme = useTheme();
  const { target } = useOnboarding();

  return (
    <Screen>
      <Text variant="label" color="secondary">
        Passo 5/5
      </Text>
      <Text variant="h1">O teu alvo diário</Text>

      <Card>
        <View style={{ alignItems: 'center' }}>
          <Text variant="display" tabular>
            {target.calories}
          </Text>
          <Text variant="caption" color="secondary">
            kcal / dia
          </Text>
        </View>
        {/* Ring with target as both consumed+target shows the full split at a glance */}
        <MacroRing consumed={target} target={target} />
        <Text variant="caption" color="secondary">
          {target.rationale}
        </Text>
        <Text variant="caption" color="secondary" tabular>
          BMR {target.bmr} · TDEE {target.tdee} kcal
        </Text>
      </Card>

      <Button label="Gerar o meu plano →" onPress={() => router.replace('/(tabs)/today')} />
      <Button
        label="Como calculámos isto"
        variant="ghost"
        onPress={() => {}}
        style={{ marginTop: -theme.space[2] }}
      />
    </Screen>
  );
}

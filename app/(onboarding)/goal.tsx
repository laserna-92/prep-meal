import React from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { SelectRow } from '@/components/ui/SelectRow';
import { useOnboarding } from '@/state/onboarding';
import type { Goal, GoalPace } from '@/types/models';

export default function GoalStep() {
  const router = useRouter();
  const { draft, update } = useOnboarding();
  return (
    <Screen>
      <Text variant="label" color="secondary">
        Passo 1/5
      </Text>
      <Text variant="h1">Qual é o teu objetivo?</Text>
      <SelectRow<Goal>
        value={draft.goal}
        onChange={(goal) => update({ goal })}
        options={[
          { value: 'cut', label: 'Perder gordura', hint: 'cut' },
          { value: 'bulk', label: 'Ganhar massa', hint: 'bulk' },
          { value: 'maintain', label: 'Manter', hint: 'maintenance' },
        ]}
      />
      <Text variant="h3">Ritmo</Text>
      <SelectRow<GoalPace>
        value={draft.goalPace}
        onChange={(goalPace) => update({ goalPace })}
        options={[
          { value: 'slow', label: 'Lento' },
          { value: 'moderate', label: 'Moderado' },
          { value: 'aggressive', label: 'Agressivo' },
        ]}
      />
      <Button label="Continuar" onPress={() => router.push('/(onboarding)/body')} />
    </Screen>
  );
}

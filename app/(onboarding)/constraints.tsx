import React from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { useOnboarding } from '@/state/onboarding';

const toInt = (s: string, fallback: number) => {
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : fallback;
};

export default function ConstraintsStep() {
  const router = useRouter();
  const { draft, update } = useOnboarding();
  return (
    <Screen>
      <Text variant="label" color="secondary">
        Passo 4/5
      </Text>
      <Text variant="h1">Como preparas as refeições?</Text>
      <Field
        label="Refeições por dia"
        value={String(draft.mealsPerDay)}
        onChangeText={(v) => update({ mealsPerDay: Math.max(1, Math.min(8, toInt(v, draft.mealsPerDay))) })}
      />
      <Text variant="body" color="secondary">
        Equipamento, dias de prep, tempo e orçamento entram aqui no build completo.
      </Text>
      <Button label="Calcular o meu plano" onPress={() => router.push('/(onboarding)/summary')} />
    </Screen>
  );
}

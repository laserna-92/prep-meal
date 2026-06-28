import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { SelectRow } from '@/components/ui/SelectRow';
import { useOnboarding } from '@/state/onboarding';
import type { ActivityLevel, Sex } from '@/types/models';

const toNum = (s: string, fallback: number) => {
  const n = parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
};

export default function BodyStep() {
  const router = useRouter();
  const { draft, update } = useOnboarding();
  return (
    <Screen>
      <Text variant="label" color="secondary">
        Passo 2/5
      </Text>
      <Text variant="h1">Sobre ti</Text>

      <SelectRow<Sex>
        value={draft.sex}
        onChange={(sex) => update({ sex })}
        options={[
          { value: 'male', label: 'Homem' },
          { value: 'female', label: 'Mulher' },
        ]}
      />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Field
            label="Altura"
            suffix="cm"
            value={String(draft.heightCm)}
            onChangeText={(v) => update({ heightCm: toNum(v, draft.heightCm) })}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label="Peso"
            suffix="kg"
            value={String(draft.weightKg)}
            onChangeText={(v) => update({ weightKg: toNum(v, draft.weightKg) })}
          />
        </View>
      </View>

      <Field
        label="Treinos por semana"
        value={String(draft.workoutsPerWeek)}
        onChangeText={(v) => update({ workoutsPerWeek: toNum(v, draft.workoutsPerWeek) })}
      />

      <Text variant="h3">Atividade diária</Text>
      <SelectRow<ActivityLevel>
        value={draft.activity}
        onChange={(activity) => update({ activity })}
        options={[
          { value: 'sedentary', label: 'Sedentário', hint: 'pouco ou nenhum exercício' },
          { value: 'light', label: 'Leve', hint: '1-2x/semana' },
          { value: 'moderate', label: 'Moderado', hint: '3-5x/semana' },
          { value: 'active', label: 'Ativo', hint: '6-7x/semana' },
          { value: 'athlete', label: 'Atleta', hint: '2x/dia / trabalho físico' },
        ]}
      />

      <Button label="Continuar" onPress={() => router.push('/(onboarding)/preferences')} />
    </Screen>
  );
}

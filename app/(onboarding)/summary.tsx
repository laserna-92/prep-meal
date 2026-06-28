import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MacroRing } from '@/components/ui/MacroRing';
import { useOnboarding } from '@/state/onboarding';
import { useTheme } from '@/theme';
import { isSupabaseConfigured } from '@/lib/supabase';
import { saveProfileAndTarget } from '@/api/profile';
import { generatePlan } from '@/api/plan';

/** ISO date (yyyy-mm-dd) of the upcoming Monday, used as the plan's week_start. */
function nextMonday(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Sun..6=Sat
  const delta = (8 - (day === 0 ? 7 : day)) % 7 || 7;
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

export default function SummaryStep() {
  const router = useRouter();
  const theme = useTheme();
  const { draft, target } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const onGenerate = async () => {
    if (!isSupabaseConfigured) {
      router.replace('/(tabs)/today'); // runs on mock data
      return;
    }
    setLoading(true);
    try {
      await saveProfileAndTarget(draft, target);
      await generatePlan(nextMonday(), 'balanced');
      router.replace('/(tabs)/today');
    } catch (e) {
      Alert.alert('Não consegui gerar o plano', e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

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

      <Button label="Gerar o meu plano →" onPress={onGenerate} loading={loading} />
      <Button
        label="Como calculámos isto"
        variant="ghost"
        onPress={() => {}}
        style={{ marginTop: -theme.space[2] }}
      />
    </Screen>
  );
}

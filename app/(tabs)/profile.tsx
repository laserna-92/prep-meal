import React from 'react';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme';
import { mockTarget } from '@/lib/mock';

export default function Profile() {
  const theme = useTheme();
  return (
    <Screen>
      <Text variant="h1">Perfil</Text>

      <Card>
        <Text variant="label" color="secondary">
          Objetivo & macros
        </Text>
        <Text variant="h3" tabular>
          {mockTarget.calories} kcal · {mockTarget.proteinG}P/{mockTarget.carbsG}C/{mockTarget.fatG}G
        </Text>
        <Button label="Recalcular" variant="secondary" onPress={() => {}} />
      </Card>

      <Card>
        <Text variant="label" color="secondary">
          Progresso
        </Text>
        <Text variant="body">Aderência da semana: 88%</Text>
        <Text variant="body" style={{ color: theme.feedback.info }}>
          🔥 Streak: 3 semanas
        </Text>
      </Card>

      <Button label="Definições" variant="ghost" onPress={() => {}} />
    </Screen>
  );
}

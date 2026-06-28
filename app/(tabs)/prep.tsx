import React from 'react';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Prep() {
  return (
    <Screen>
      <Text variant="h1">Modo Cozinha</Text>
      <Card>
        <Text variant="h3">O que vais preparar?</Text>
        <Text variant="body" color="secondary">
          Seleciona refeições e gera um roteiro otimizado de batch cooking com timers e
          etiquetas de tupperware. (placeholder do scaffold — ver docs/02 §5)
        </Text>
        <Text variant="caption" color="secondary">
          Estimativa: 1h45 · 8 tuppers
        </Text>
      </Card>
      <Button label="Gerar roteiro →" onPress={() => {}} />
    </Screen>
  );
}

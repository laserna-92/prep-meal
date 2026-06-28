import React from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

export default function PreferencesStep() {
  const router = useRouter();
  // Diet / allergies / favorites are collected here in a full build; the
  // scaffold keeps the step minimal and forwards to constraints.
  return (
    <Screen>
      <Text variant="label" color="secondary">
        Passo 3/5
      </Text>
      <Text variant="h1">Preferências</Text>
      <Text variant="body" color="secondary">
        Dieta, alergias e alimentos a evitar entram aqui. (placeholder do scaffold)
      </Text>
      <Field label="Alimentos a evitar (separados por vírgula)" keyboardType="default" value="" onChangeText={() => {}} />
      <Button label="Continuar" onPress={() => router.push('/(onboarding)/constraints')} />
    </Screen>
  );
}

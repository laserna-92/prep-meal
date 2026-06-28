import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme';

export default function Welcome() {
  const router = useRouter();
  const theme = useTheme();
  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.space[4] }}>
        <Text variant="display">🍱</Text>
        <Text variant="h1">PrepMeal</Text>
        <Text variant="body" color="secondary" style={{ textAlign: 'center' }}>
          Do objetivo ao tupperware em 10 minutos.
        </Text>
      </View>
      <Button label="Começar" onPress={() => router.push('/(onboarding)/goal')} />
    </Screen>
  );
}

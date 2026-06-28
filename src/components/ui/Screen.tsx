/**
 * Screen — safe-area canvas wrapper with consistent gutters (docs/03 §2.6).
 */
import React from 'react';
import { ScrollView, View, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

export interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Screen({ children, scroll = true, style }: ScreenProps) {
  const theme = useTheme();
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.canvas }} edges={['top']}>
      <Container
        style={{ flex: 1 }}
        contentContainerStyle={
          scroll
            ? { padding: theme.space[4], gap: theme.space[4], paddingBottom: theme.space[12] }
            : undefined
        }
      >
        {scroll ? children : <View style={[{ flex: 1, padding: theme.space[4] }, style]}>{children}</View>}
      </Container>
    </SafeAreaView>
  );
}

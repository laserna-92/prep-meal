/**
 * Card — elevated surface container (docs/03 shadow/card).
 */
import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.elevated,
          borderRadius: theme.radius.lg,
          padding: theme.space[4],
          gap: theme.space[3],
          borderWidth: theme.mode === 'dark' ? 1 : 0,
          borderColor: theme.colors.border,
          shadowColor: '#0F172A',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

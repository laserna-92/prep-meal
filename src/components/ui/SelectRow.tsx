/**
 * SelectRow — single-choice radio list used across onboarding (docs/03 §3.7).
 */
import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

export function SelectRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.space[2] }}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(opt.value)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: theme.space[4],
              borderRadius: theme.radius.md,
              borderWidth: selected ? 2 : 1,
              borderColor: selected ? theme.colors.brand : theme.colors.border,
              backgroundColor: theme.colors.elevated,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text variant="h3">{opt.label}</Text>
              {opt.hint && (
                <Text variant="caption" color="secondary">
                  {opt.hint}
                </Text>
              )}
            </View>
            <Text style={{ color: selected ? theme.colors.brand : theme.colors.border }}>
              {selected ? '●' : '○'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

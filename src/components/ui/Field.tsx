/**
 * Field — labeled numeric/text input row.
 */
import React from 'react';
import { TextInput, View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export function Field({
  label,
  value,
  onChangeText,
  keyboardType = 'numeric',
  suffix,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'numeric' | 'default';
  suffix?: string;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.space[1] }}>
      <Text variant="label" color="secondary">
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.space[4],
          height: 48,
          backgroundColor: theme.colors.elevated,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor={theme.colors.textSecondary}
          style={{ flex: 1, fontSize: 15, color: theme.colors.textPrimary }}
        />
        {suffix && (
          <Text variant="body" color="secondary">
            {suffix}
          </Text>
        )}
      </View>
    </View>
  );
}

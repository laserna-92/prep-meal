/**
 * MacroBar — single macro progress bar with fixed macro color (docs/03 §3.3).
 * Over-target overflow is tinted with the warning color.
 */
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export type MacroKind = 'protein' | 'carbs' | 'fat';

const LABEL: Record<MacroKind, string> = { protein: 'P', carbs: 'C', fat: 'G' };

export interface MacroBarProps {
  kind: MacroKind;
  value: number;
  target: number;
  unit?: string;
}

export function MacroBar({ kind, value, target, unit = 'g' }: MacroBarProps) {
  const theme = useTheme();
  const color = theme.macro[kind];
  const ratio = target > 0 ? value / target : 0;
  const over = ratio > 1;
  const fill = Math.min(ratio, 1);

  return (
    <View style={{ gap: theme.space[1] }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="label" style={{ color }}>
          {LABEL[kind]}
        </Text>
        <Text variant="label" color="secondary" tabular>
          {Math.round(value)}/{Math.round(target)} {unit}
        </Text>
      </View>
      <View
        style={{
          height: 8,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.surface,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${fill * 100}%`,
            height: '100%',
            backgroundColor: over ? theme.feedback.warning : color,
          }}
        />
      </View>
    </View>
  );
}

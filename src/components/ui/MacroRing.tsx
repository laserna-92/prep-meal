/**
 * MacroRing — calorie ring (consumed/target) with the day's macro bars beside it
 * (docs/03 §3.2). The ring's filled arc tints to `warning` when over target.
 */
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { MacroBar } from './MacroBar';
import type { Macros } from '@/types/models';

export interface MacroRingProps {
  consumed: Macros;
  target: Macros;
  size?: number;
}

export function MacroRing({ consumed, target, size = 104 }: MacroRingProps) {
  const theme = useTheme();
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = target.calories > 0 ? consumed.calories / target.calories : 0;
  const over = ratio > 1;
  const dash = Math.min(ratio, 1) * c;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[5] }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.colors.surface} strokeWidth={stroke} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={over ? theme.feedback.warning : theme.colors.brand}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <Text variant="h2" tabular>
          {Math.round(consumed.calories)}
        </Text>
        <Text variant="caption" color="secondary" tabular>
          /{Math.round(target.calories)}
        </Text>
      </View>

      <View style={{ flex: 1, gap: theme.space[2] }}>
        <MacroBar kind="protein" value={consumed.proteinG} target={target.proteinG} />
        <MacroBar kind="carbs" value={consumed.carbsG} target={target.carbsG} />
        <MacroBar kind="fat" value={consumed.fatG} target={target.fatG} />
      </View>
    </View>
  );
}

/**
 * Typed Text wrapper with design-system variants and semantic colors.
 * Usage: <Text variant="h1">Hoje</Text> · <Text color="secondary">…</Text>
 */
import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native';
import { useTheme } from '@/theme';
import type { TypographyVariant } from '@/theme/tokens';

type ColorKey = 'primary' | 'secondary' | 'brand';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: ColorKey | string;
  tabular?: boolean;
}

export function Text({ variant = 'body', color = 'primary', tabular, style, ...rest }: TextProps) {
  const theme = useTheme();
  const v = theme.typography[variant];

  const resolvedColor =
    color === 'primary'
      ? theme.colors.textPrimary
      : color === 'secondary'
        ? theme.colors.textSecondary
        : color === 'brand'
          ? theme.colors.brand
          : color;

  const base: StyleProp<TextStyle> = {
    fontSize: v.fontSize,
    lineHeight: v.lineHeight,
    fontWeight: v.fontWeight as TextStyle['fontWeight'],
    color: resolvedColor,
    fontVariant: tabular ? ['tabular-nums'] : undefined,
  };

  return <RNText style={[base, style]} {...rest} />;
}

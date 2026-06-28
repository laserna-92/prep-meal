/**
 * Button — primary / secondary / ghost / destructive variants (docs/03 §3.1).
 * Full-width by default for screen CTAs. Handles pressed / loading / disabled.
 */
import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

const HEIGHT: Record<Size, number> = { sm: 36, md: 44, lg: 52 };

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const bg: Record<Variant, string> = {
    primary: theme.colors.brand,
    secondary: theme.colors.surface,
    ghost: 'transparent',
    destructive: theme.feedback.error,
  };
  const fg: Record<Variant, string> = {
    primary: theme.colors.brandContrast,
    secondary: theme.colors.textPrimary,
    ghost: theme.colors.brand,
    destructive: '#FFFFFF',
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          height: HEIGHT[size],
          width: fullWidth ? '100%' : undefined,
          paddingHorizontal: theme.space[5],
          borderRadius: theme.radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          backgroundColor: bg[variant],
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: theme.colors.border,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg[variant]} />
      ) : (
        <Text variant="h3" style={{ color: fg[variant] }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

/**
 * Theme provider + useTheme hook.
 * Resolves semantic tokens for light/dark per docs/03 §2.4.
 */
import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { palette, macroColors, feedback, space, radius, typography, motion } from './tokens';

type SemanticColors = {
  canvas: string;
  surface: string;
  elevated: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  brand: string;
  brandContrast: string;
};

const light: SemanticColors = {
  canvas: palette.white,
  surface: palette.ink100, // #F1F5F9 close to #F8FAFC; keep one neutral surface
  elevated: palette.white,
  textPrimary: palette.ink900,
  textSecondary: palette.ink500,
  border: palette.ink300,
  brand: palette.brand600,
  brandContrast: palette.white,
};

const dark: SemanticColors = {
  canvas: palette.darkCanvas,
  surface: palette.darkSurface,
  elevated: palette.darkElevated,
  textPrimary: palette.darkText,
  textSecondary: palette.darkTextSecondary,
  border: palette.darkBorder,
  brand: palette.brand500,
  brandContrast: palette.white,
};

export type Theme = {
  mode: 'light' | 'dark';
  colors: SemanticColors;
  macro: typeof macroColors;
  feedback: typeof feedback;
  space: typeof space;
  radius: typeof radius;
  typography: typeof typography;
  motion: typeof motion;
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const mode = scheme === 'dark' ? 'dark' : 'light';
  const value = useMemo<Theme>(
    () => ({
      mode,
      colors: mode === 'dark' ? dark : light,
      macro: macroColors,
      feedback,
      space,
      radius,
      typography,
      motion,
    }),
    [mode],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}

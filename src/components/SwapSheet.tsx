/**
 * SwapSheet — bottom sheet of swap alternatives (docs/02 §3.1, docs/03 §3.8).
 * Modal-based so it works on web and native without extra gesture deps.
 */
import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './ui/Text';
import { Button } from './ui/Button';
import type { PlannedMeal, RecipeSummary } from '@/types/models';

export interface SwapSheetProps {
  visible: boolean;
  meal: PlannedMeal | null;
  alternatives: RecipeSummary[];
  loading?: boolean;
  onSelect: (recipe: RecipeSummary) => void;
  onClose: () => void;
}

export function SwapSheet({ visible, meal, alternatives, loading, onSelect, onClose }: SwapSheetProps) {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onClose} />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colors.elevated,
          borderTopLeftRadius: theme.radius.xl,
          borderTopRightRadius: theme.radius.xl,
          padding: theme.space[4],
          gap: theme.space[3],
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.colors.border }} />
        </View>
        <Text variant="h3">Trocar {meal ? `"${meal.recipe.title}"` : 'refeição'}</Text>
        {meal && (
          <Text variant="caption" color="secondary" tabular>
            alvo ~{meal.macros.calories} kcal · {meal.macros.proteinG}P
          </Text>
        )}

        {loading && (
          <Text variant="body" color="secondary">
            A procurar alternativas…
          </Text>
        )}
        {!loading && alternatives.length === 0 && (
          <Text variant="body" color="secondary">
            Sem alternativas para este slot.
          </Text>
        )}

        {alternatives.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => onSelect(r)}
            style={{
              padding: theme.space[4],
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text variant="h3">{r.title}</Text>
            <Text variant="caption" color="secondary" tabular>
              {r.perServing.calories} kcal · {r.perServing.proteinG}P · {r.prepMinutes} min
            </Text>
          </Pressable>
        ))}

        <Button label="Cancelar" variant="secondary" onPress={onClose} />
      </View>
    </Modal>
  );
}

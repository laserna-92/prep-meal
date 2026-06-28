import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SwapSheet } from '@/components/SwapSheet';
import { useTheme } from '@/theme';
import { isSupabaseConfigured } from '@/lib/supabase';
import { mockPlan, mockAlternatives } from '@/lib/mock';
import { DAY_LABELS, nextMonday } from '@/lib/dates';
import { getCurrentPlan, generatePlan, getAlternatives, swapMeal, confirmPlan } from '@/api/plan';
import type { MealPlan, PlannedMeal, RecipeSummary } from '@/types/models';

const SLOT_LABEL: Record<string, string> = {
  breakfast: 'Peq-almoço',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Snack',
};

export default function Plan() {
  const theme = useTheme();
  const router = useRouter();

  const [plan, setPlan] = useState<MealPlan | null>(isSupabaseConfigured ? null : mockPlan);
  const [activeDay, setActiveDay] = useState(0);
  const [busy, setBusy] = useState(false);

  // swap sheet state
  const [swapMealTarget, setSwapMealTarget] = useState<PlannedMeal | null>(null);
  const [alternatives, setAlternatives] = useState<RecipeSummary[]>([]);
  const [altLoading, setAltLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const p = await getCurrentPlan();
    setPlan(p);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const onGenerate = async () => {
    if (!isSupabaseConfigured) {
      setPlan({ ...mockPlan });
      return;
    }
    setBusy(true);
    try {
      await generatePlan(plan?.weekStart ?? nextMonday(), 'balanced');
      await reload();
    } catch (e) {
      Alert.alert('Erro ao gerar', e instanceof Error ? e.message : 'Erro');
    } finally {
      setBusy(false);
    }
  };

  const onConfirm = async () => {
    if (!plan) return;
    if (!isSupabaseConfigured) {
      router.push('/shopping-list');
      return;
    }
    setBusy(true);
    try {
      await confirmPlan(plan.id, 1);
      router.push({ pathname: '/shopping-list', params: { planId: plan.id } });
    } catch (e) {
      Alert.alert('Erro ao confirmar', e instanceof Error ? e.message : 'Erro');
    } finally {
      setBusy(false);
    }
  };

  const openSwap = async (meal: PlannedMeal) => {
    setSwapMealTarget(meal);
    if (!isSupabaseConfigured) {
      setAlternatives(mockAlternatives);
      return;
    }
    setAltLoading(true);
    try {
      setAlternatives(await getAlternatives(meal.id));
    } finally {
      setAltLoading(false);
    }
  };

  const onPickAlternative = async (recipe: RecipeSummary) => {
    const meal = swapMealTarget;
    setSwapMealTarget(null);
    if (!meal) return;
    if (!isSupabaseConfigured) return; // mock: nothing to persist
    try {
      await swapMeal(meal.id, recipe.id);
      await reload();
    } catch (e) {
      Alert.alert('Erro ao trocar', e instanceof Error ? e.message : 'Erro');
    }
  };

  const day = plan?.days.find((d) => d.dayOfWeek === activeDay) ?? plan?.days[0];

  return (
    <Screen>
      <Text variant="h1">Plano</Text>
      {plan ? (
        <Text variant="caption" color="secondary">
          Semana de {plan.weekStart} · {plan.status === 'confirmed' ? 'confirmado' : 'rascunho'}
        </Text>
      ) : (
        <Text variant="caption" color="secondary">
          Ainda sem plano para esta semana.
        </Text>
      )}

      {plan && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {DAY_LABELS.map((d, i) => {
            const selected = i === activeDay;
            return (
              <Pressable
                key={d}
                onPress={() => setActiveDay(i)}
                style={{
                  paddingVertical: theme.space[2],
                  paddingHorizontal: theme.space[2],
                  borderRadius: theme.radius.md,
                  backgroundColor: selected ? theme.colors.brand : 'transparent',
                }}
              >
                <Text variant="label" style={{ color: selected ? theme.colors.brandContrast : theme.colors.textSecondary }}>
                  {d}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {day && (
        <Card>
          {day.meals.map((m) => (
            <View
              key={m.id}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.space[2] }}
            >
              <View style={{ flex: 1 }}>
                <Text variant="label" color="secondary">
                  {SLOT_LABEL[m.slot] ?? m.slot}
                </Text>
                <Text variant="h3">{m.recipe.title}</Text>
                <Text variant="caption" color="secondary" tabular>
                  {m.macros.calories} kcal · {m.macros.proteinG}P
                </Text>
              </View>
              <Button label="Trocar" size="sm" variant="secondary" fullWidth={false} onPress={() => openSwap(m)} />
            </View>
          ))}
          {day.totals && (
            <Text variant="caption" color="secondary" tabular>
              Total do dia: {day.totals.calories} kcal · {day.totals.proteinG}P/{day.totals.carbsG}C/{day.totals.fatG}G
            </Text>
          )}
        </Card>
      )}

      <Button
        label={plan ? '⟳ Regenerar semana' : 'Gerar plano'}
        variant={plan ? 'secondary' : 'primary'}
        loading={busy}
        onPress={onGenerate}
      />
      {plan && <Button label="🛒 Confirmar e ver lista" loading={busy} onPress={onConfirm} />}

      <SwapSheet
        visible={swapMealTarget !== null}
        meal={swapMealTarget}
        alternatives={alternatives}
        loading={altLoading}
        onSelect={onPickAlternative}
        onClose={() => setSwapMealTarget(null)}
      />
    </Screen>
  );
}

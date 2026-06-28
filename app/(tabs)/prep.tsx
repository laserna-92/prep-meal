import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme';
import { isSupabaseConfigured } from '@/lib/supabase';
import { mockPlan, mockCookPlan } from '@/lib/mock';
import { DAY_LABELS } from '@/lib/dates';
import { getCurrentPlan } from '@/api/plan';
import { getCookPlan, completeCookPlan, type CookPlan, type CookTechnique } from '@/api/cook';
import type { MealPlan, PlannedMeal } from '@/types/models';

const TECH: Record<CookTechnique, { label: string; color: string }> = {
  oven: { label: 'Forno', color: '#EF4444' },
  stove: { label: 'Fogão', color: '#F59E0B' },
  prep: { label: 'Prep', color: '#6366F1' },
  rest: { label: 'Repouso', color: '#64748B' },
  assemble: { label: 'Montar', color: '#16A34A' },
};

export default function Prep() {
  const theme = useTheme();
  const [plan, setPlan] = useState<MealPlan | null>(isSupabaseConfigured ? null : mockPlan);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cook, setCook] = useState<CookPlan | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => setPlan(await getCurrentPlan()))();
  }, []);

  // Flatten meals; default-select prep-friendly ones once the plan loads.
  const allMeals = useMemo<PlannedMeal[]>(() => plan?.days.flatMap((d) => d.meals) ?? [], [plan]);
  useEffect(() => {
    if (allMeals.length && selected.size === 0) {
      setSelected(new Set(allMeals.filter((m) => m.recipe.isPrepFriendly).map((m) => m.id)));
    }
  }, [allMeals]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const onGenerate = async () => {
    const ids = [...selected];
    if (ids.length === 0) {
      Alert.alert('Seleciona refeições', 'Escolhe pelo menos uma refeição para preparar.');
      return;
    }
    setBusy(true);
    try {
      setCook(isSupabaseConfigured && plan ? await getCookPlan(plan.id, ids) : mockCookPlan);
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao gerar roteiro');
    } finally {
      setBusy(false);
    }
  };

  const onComplete = async () => {
    setBusy(true);
    try {
      if (isSupabaseConfigured) await completeCookPlan([...selected]);
      Alert.alert('Prep concluído ✓', 'As refeições ficaram prontas no separador Hoje.');
      setCook(null);
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Erro');
    } finally {
      setBusy(false);
    }
  };

  // ── Roteiro view ────────────────────────────────────────────────────────────
  if (cook) {
    return (
      <Screen>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="h1">Roteiro</Text>
          <Button label="Voltar" size="sm" variant="ghost" fullWidth={false} onPress={() => setCook(null)} />
        </View>
        <Text variant="caption" color="secondary" tabular>
          ~{cook.estimateMinutes} min · {cook.containers} tuppers
        </Text>

        <Card>
          {cook.timeline.map((step) => {
            const t = TECH[step.technique];
            return (
              <View key={step.order} style={{ flexDirection: 'row', gap: theme.space[3], paddingVertical: theme.space[2] }}>
                <Text variant="label" color="secondary" tabular style={{ width: 20 }}>
                  {step.order}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text variant="body">{step.instruction}</Text>
                  <View style={{ flexDirection: 'row', gap: theme.space[2], marginTop: 2 }}>
                    <Text variant="caption" style={{ color: t.color }}>
                      {t.label}
                      {step.parallel ? ' ∥' : ''}
                    </Text>
                    {step.durationMin > 0 && (
                      <Text variant="caption" color="secondary" tabular>
                        {step.durationMin} min
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </Card>

        <Text variant="h2">Etiquetas</Text>
        {cook.labels.map((l, i) => (
          <Card key={i}>
            <Text variant="label" color="secondary">
              {DAY_LABELS[l.day] ?? ''} {l.slot ? `· ${l.slot}` : ''}
            </Text>
            <Text variant="h3">{l.meal}</Text>
            <Text variant="caption" color="secondary" tabular>
              {l.macros.calories} kcal · {l.macros.proteinG}P/{l.macros.carbsG}C/{l.macros.fatG}G
            </Text>
            <Text variant="caption" color="secondary">
              Validade: {l.useByDate}
            </Text>
          </Card>
        ))}

        <Button label="Concluir prep ✓" loading={busy} onPress={onComplete} />
      </Screen>
    );
  }

  // ── Selection view ──────────────────────────────────────────────────────────
  return (
    <Screen>
      <Text variant="h1">Modo Cozinha</Text>
      <Text variant="body" color="secondary">
        Escolhe o que vais preparar e gera um roteiro otimizado de batch cooking.
      </Text>

      {!plan && (
        <Text variant="body" color="secondary">
          Sem plano ainda. Gera um no separador Plano.
        </Text>
      )}

      {plan?.days.map((d) => (
        <Card key={d.dayOfWeek}>
          <Text variant="label" color="secondary">
            {DAY_LABELS[d.dayOfWeek]}
          </Text>
          {d.meals.map((m) => {
            const on = selected.has(m.id);
            return (
              <Pressable
                key={m.id}
                onPress={() => toggle(m.id)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3], paddingVertical: theme.space[2] }}
              >
                <Text style={{ color: on ? theme.colors.brand : theme.colors.border }}>{on ? '☑' : '☐'}</Text>
                <Text variant="body" style={{ flex: 1 }}>
                  {m.recipe.title}
                </Text>
                <Text variant="caption" color="secondary" tabular>
                  {m.macros.calories} kcal
                </Text>
              </Pressable>
            );
          })}
        </Card>
      ))}

      {plan && (
        <Button label={`Gerar roteiro (${selected.size}) →`} loading={busy} onPress={onGenerate} />
      )}
    </Screen>
  );
}

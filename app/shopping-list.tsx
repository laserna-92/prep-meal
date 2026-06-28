import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme';
import { isSupabaseConfigured } from '@/lib/supabase';
import { mockShoppingList } from '@/lib/mock';
import { getShoppingList, setShoppingItem, aisleLabel, type ShoppingList } from '@/api/shopping';
import type { ShoppingItem } from '@/types/models';

export default function ShoppingListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId?: string }>();

  const [list, setList] = useState<ShoppingList | null>(isSupabaseConfigured ? null : mockShoppingList);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !planId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setList(await getShoppingList(planId));
      } finally {
        setLoading(false);
      }
    })();
  }, [planId]);

  const toggleHave = async (item: ShoppingItem) => {
    const next = !item.haveAtHome;
    // optimistic update
    setList((prev) =>
      prev
        ? {
            ...prev,
            aisles: prev.aisles.map((a) => ({
              ...a,
              items: a.items.map((it) => (it.id === item.id ? { ...it, haveAtHome: next } : it)),
            })),
          }
        : prev,
    );
    if (isSupabaseConfigured) {
      try {
        await setShoppingItem(item.id, { haveAtHome: next });
      } catch {
        /* keep optimistic state; a full reload would reconcile */
      }
    }
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="h1">Lista de compras</Text>
        <Button label="Fechar" size="sm" variant="ghost" fullWidth={false} onPress={() => router.back()} />
      </View>

      {list && (
        <Text variant="caption" color="secondary" tabular>
          ~{list.estTotal.toFixed(2)} € · {list.people} pessoa(s)
        </Text>
      )}

      {loading && (
        <Text variant="body" color="secondary">
          A montar a lista…
        </Text>
      )}
      {!loading && !list && (
        <Text variant="body" color="secondary">
          Sem lista. Confirma um plano primeiro.
        </Text>
      )}

      {list?.aisles.map((group) => (
        <Card key={group.aisle}>
          <Text variant="label" color="secondary">
            {aisleLabel(group.aisle)}
          </Text>
          {group.items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => toggleHave(item)}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.space[2], gap: theme.space[3] }}
            >
              <Text style={{ color: item.haveAtHome ? theme.colors.brand : theme.colors.border }}>
                {item.haveAtHome ? '☑' : '☐'}
              </Text>
              <Text
                variant="body"
                style={{
                  flex: 1,
                  textDecorationLine: item.haveAtHome ? 'line-through' : 'none',
                  opacity: item.haveAtHome ? 0.5 : 1,
                }}
              >
                {item.name}
              </Text>
              <Text variant="caption" color="secondary" tabular>
                {Math.round(item.quantity)} {item.unit}
              </Text>
            </Pressable>
          ))}
        </Card>
      ))}
    </Screen>
  );
}

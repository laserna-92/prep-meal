/**
 * Shopping list: read (grouped by aisle) and per-item toggles (docs/05 §6).
 */
import { supabase } from '@/lib/supabase';
import type { Aisle, ShoppingItem } from '@/types/models';

export interface ShoppingList {
  id: string;
  people: number;
  estTotal: number;
  aisles: { aisle: Aisle; items: ShoppingItem[] }[];
}

const AISLE_ORDER: Aisle[] = ['produce', 'butcher', 'fish', 'dairy', 'bakery', 'grocery', 'frozen', 'other'];
const AISLE_LABEL: Record<Aisle, string> = {
  produce: '🥦 Hortícolas',
  butcher: '🥩 Talho',
  fish: '🐟 Peixaria',
  dairy: '🥛 Laticínios',
  bakery: '🥖 Padaria',
  grocery: '🌾 Mercearia',
  frozen: '❄️ Congelados',
  other: '🧺 Outros',
};

export const aisleLabel = (a: Aisle) => AISLE_LABEL[a];

/** Read the shopping list for a plan, grouped and ordered by supermarket aisle. */
export async function getShoppingList(planId: string): Promise<ShoppingList | null> {
  const { data, error } = await supabase
    .from('shopping_lists')
    .select(`id, people, est_total,
      shopping_items ( id, aisle, quantity, unit, est_price, have_at_home, checked,
        ingredients ( name ) )`)
    .eq('plan_id', planId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const rows = (data.shopping_items ?? []) as any[];
  const items: ShoppingItem[] = rows.map((r) => ({
    id: r.id,
    name: r.ingredients?.name ?? '—',
    quantity: Number(r.quantity),
    unit: r.unit,
    aisle: r.aisle,
    estPrice: r.est_price ?? undefined,
    haveAtHome: r.have_at_home,
    checked: r.checked,
  }));

  const byAisle = new Map<Aisle, ShoppingItem[]>();
  for (const it of items) {
    const list = byAisle.get(it.aisle) ?? [];
    list.push(it);
    byAisle.set(it.aisle, list);
  }

  const aisles = AISLE_ORDER.filter((a) => byAisle.has(a)).map((aisle) => ({
    aisle,
    items: (byAisle.get(aisle) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
  }));

  return { id: data.id, people: data.people, estTotal: Number(data.est_total ?? 0), aisles };
}

/** Toggle "have at home" / "checked" on an item. */
export async function setShoppingItem(id: string, patch: { haveAtHome?: boolean; checked?: boolean }) {
  const dbPatch: Record<string, boolean> = {};
  if (patch.haveAtHome !== undefined) dbPatch.have_at_home = patch.haveAtHome;
  if (patch.checked !== undefined) dbPatch.checked = patch.checked;
  const { error } = await supabase.from('shopping_items').update(dbPatch).eq('id', id);
  if (error) throw error;
}

-- PrepMeal — server-side business logic: macro recomputation and shopping-list
-- aggregation. Nutritional values are NEVER trusted from the client (docs/04 §4).

-- Convert a recipe-ingredient quantity to grams of the ingredient base unit.
-- ml uses density when known (else 1 g/ml); 'un' is treated as already in base.
create or replace function ri_grams(p_qty numeric, p_unit measure_unit, ing ingredients)
returns numeric language plpgsql immutable as $$
begin
  return case p_unit
    when 'g'    then p_qty
    when 'ml'   then p_qty * coalesce(ing.density_g_ml, 1)
    when 'tbsp' then p_qty * 15 * coalesce(ing.density_g_ml, 1)
    when 'tsp'  then p_qty * 5  * coalesce(ing.density_g_ml, 1)
    when 'cup'  then p_qty * 240 * coalesce(ing.density_g_ml, 1)
    else p_qty -- 'un': caller-defined, assume base unit
  end;
end;
$$;

-- Recompute a recipe's per-serving macros + cost from its ingredients.
create or replace function recalc_recipe(p_recipe uuid)
returns void language plpgsql as $$
declare
  v_serv smallint;
  v_kcal numeric := 0; v_p numeric := 0; v_c numeric := 0; v_f numeric := 0; v_cost numeric := 0;
begin
  select servings into v_serv from recipes where id = p_recipe;
  if v_serv is null or v_serv = 0 then v_serv := 1; end if;

  select
    coalesce(sum(g/100 * i.kcal_per_100),    0),
    coalesce(sum(g/100 * i.protein_per_100), 0),
    coalesce(sum(g/100 * i.carbs_per_100),   0),
    coalesce(sum(g/100 * i.fat_per_100),     0),
    coalesce(sum(g/100 * coalesce(i.price_per_100,0)), 0)
  into v_kcal, v_p, v_c, v_f, v_cost
  from recipe_ingredients ri
  join ingredients i on i.id = ri.ingredient_id
  cross join lateral (select ri_grams(ri.quantity, ri.unit, i) as g) gx
  where ri.recipe_id = p_recipe;

  update recipes set
    kcal_per_serv    = round(v_kcal / v_serv),
    protein_per_serv = round(v_p / v_serv),
    carbs_per_serv   = round(v_c / v_serv),
    fat_per_serv     = round(v_f / v_serv),
    cost_per_serv    = round((v_cost / v_serv)::numeric, 2)
  where id = p_recipe;
end;
$$;

create or replace function trg_recalc_recipe() returns trigger language plpgsql as $$
begin
  perform recalc_recipe(coalesce(new.recipe_id, old.recipe_id));
  return null;
end;
$$;
create trigger recipe_ingredients_recalc
  after insert or update or delete on recipe_ingredients
  for each row execute function trg_recalc_recipe();

-- Keep planned-meal macros in sync = recipe per-serving × servings.
create or replace function trg_planned_meal_macros() returns trigger language plpgsql as $$
declare r recipes;
begin
  select * into r from recipes where id = new.recipe_id;
  new.kcal      := round(r.kcal_per_serv    * new.servings);
  new.protein_g := round(r.protein_per_serv * new.servings);
  new.carbs_g   := round(r.carbs_per_serv   * new.servings);
  new.fat_g     := round(r.fat_per_serv     * new.servings);
  return new;
end;
$$;
create trigger planned_meals_macros
  before insert or update of recipe_id, servings on planned_meals
  for each row execute function trg_planned_meal_macros();

-- updated_at touch for profiles.
create or replace function trg_touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;
create trigger profiles_touch before update on profiles
  for each row execute function trg_touch_updated_at();

-- Aggregate a plan's ingredients into a shopping list (sum + dedupe by ingredient).
-- Scaled by `p_people`. Replaces any existing list for the plan.
create or replace function generate_shopping_list(p_plan uuid, p_people smallint default 1)
returns uuid language plpgsql as $$
declare v_list uuid;
begin
  delete from shopping_lists where plan_id = p_plan;
  insert into shopping_lists(plan_id, people) values (p_plan, p_people) returning id into v_list;

  insert into shopping_items(list_id, ingredient_id, aisle, quantity, unit, est_price)
  select
    v_list,
    i.id,
    i.aisle,
    round(sum(ri_grams(ri.quantity, ri.unit, i) * pm.servings) * p_people, 1),
    i.base_unit,
    round(sum(ri_grams(ri.quantity, ri.unit, i) * pm.servings) * p_people / 100
          * coalesce(i.price_per_100, 0), 2)
  from planned_meals pm
  join recipe_ingredients ri on ri.recipe_id = pm.recipe_id
  join ingredients i on i.id = ri.ingredient_id
  where pm.plan_id = p_plan
  group by i.id, i.aisle, i.base_unit;

  update shopping_lists sl
    set est_total = (select coalesce(sum(est_price), 0) from shopping_items where list_id = v_list)
  where sl.id = v_list;

  return v_list;
end;
$$;

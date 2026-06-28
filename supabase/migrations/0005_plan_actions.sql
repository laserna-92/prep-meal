-- PrepMeal — plan actions: meal swap alternatives, swap, and confirm→shopping list.
-- All security invoker so RLS governs access (docs/05 §5–6).

-- Candidate recipes to swap a planned meal for: same slot, closest calories to
-- the meal's current per-serving total, excluding the current recipe.
create or replace function meal_alternatives(p_meal uuid, p_limit int default 3)
returns setof recipes
language sql stable security invoker as $$
  with m as (
    select pm.slot, pm.recipe_id, (r.kcal_per_serv * pm.servings) as target_kcal
    from planned_meals pm
    join recipes r on r.id = pm.recipe_id
    where pm.id = p_meal
  )
  select r.*
  from recipes r, m
  where r.is_published
    and m.slot = any(r.suitable_slots)
    and r.id <> m.recipe_id
    and r.kcal_per_serv > 0
  order by abs(r.kcal_per_serv - m.target_kcal) asc, r.id
  limit greatest(p_limit, 1);
$$;

-- Replace a meal's recipe, rescaling servings to preserve its slot calorie share.
create or replace function swap_meal(p_meal uuid, p_recipe uuid)
returns void language plpgsql security invoker as $$
declare
  v_slot_kcal numeric;
  v_kcal integer;
begin
  select (mp.target_snapshot->>'calories')::numeric / nullif(cnt.n, 0)
  into v_slot_kcal
  from planned_meals pm
  join meal_plans mp on mp.id = pm.plan_id
  join (
    select plan_id, day_of_week, count(*) n
    from planned_meals group by plan_id, day_of_week
  ) cnt on cnt.plan_id = pm.plan_id and cnt.day_of_week = pm.day_of_week
  where pm.id = p_meal;

  if v_slot_kcal is null then raise exception 'meal_not_found'; end if;

  select kcal_per_serv into v_kcal from recipes where id = p_recipe;
  if coalesce(v_kcal, 0) = 0 then raise exception 'recipe_not_found'; end if;

  update planned_meals
  set recipe_id = p_recipe,
      servings  = greatest(0.5, least(3.0, round((v_slot_kcal / v_kcal)::numeric, 1)))
  where id = p_meal;  -- macros recomputed by the planned_meals trigger
end;
$$;

-- Confirm a plan and (re)build its shopping list. Returns the shopping list id.
create or replace function confirm_plan(p_plan uuid, p_people smallint default 1)
returns uuid language plpgsql security invoker as $$
declare v_list uuid;
begin
  update meal_plans set status = 'confirmed'
  where id = p_plan and user_id = auth.uid();
  if not found then raise exception 'plan_not_found'; end if;

  v_list := generate_shopping_list(p_plan, p_people);
  return v_list;
end;
$$;
